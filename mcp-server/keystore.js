/**
 * Secure Key Management for MCP Server
 * Handles wallet private keys with encryption and secure storage
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.ascent');
const KEYSTORE_PATH = path.join(CONFIG_DIR, 'keystore.json');
const MASTER_KEY_PATH = path.join(CONFIG_DIR, '.master_key');

// Ensure config directory exists
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * Generate or load master encryption key
 */
function getMasterKey() {
  ensureConfigDir();
  
  if (fs.existsSync(MASTER_KEY_PATH)) {
    return fs.readFileSync(MASTER_KEY_PATH);
  }
  
  // Generate new master key
  const key = crypto.randomBytes(32);
  fs.writeFileSync(MASTER_KEY_PATH, key, { mode: 0o600 });
  return key;
}

/**
 * Encrypt a private key
 */
function encryptPrivateKey(privateKey, masterKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted: encrypted
  };
}

/**
 * Decrypt a private key
 */
function decryptPrivateKey(encryptedData, masterKey) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    masterKey,
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Load keystore
 */
function loadKeystore() {
  ensureConfigDir();
  
  if (!fs.existsSync(KEYSTORE_PATH)) {
    return { wallets: [], defaultWallet: null };
  }
  
  try {
    return JSON.parse(fs.readFileSync(KEYSTORE_PATH, 'utf8'));
  } catch (e) {
    return { wallets: [], defaultWallet: null };
  }
}

/**
 * Save keystore
 */
function saveKeystore(keystore) {
  ensureConfigDir();
  fs.writeFileSync(KEYSTORE_PATH, JSON.stringify(keystore, null, 2), { mode: 0o600 });
}

/**
 * Add a wallet to the keystore
 */
function addWallet(name, privateKey, makeDefault = false) {
  const masterKey = getMasterKey();
  const keystore = loadKeystore();
  
  // Check if wallet already exists
  const existingIndex = keystore.wallets.findIndex(w => w.name === name);
  
  const walletEntry = {
    name,
    encryptedKey: encryptPrivateKey(privateKey, masterKey),
    createdAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    keystore.wallets[existingIndex] = walletEntry;
  } else {
    keystore.wallets.push(walletEntry);
  }
  
  if (makeDefault || !keystore.defaultWallet) {
    keystore.defaultWallet = name;
  }
  
  saveKeystore(keystore);
  return walletEntry;
}

/**
 * Get a wallet's private key
 */
function getWallet(name) {
  const masterKey = getMasterKey();
  const keystore = loadKeystore();
  
  const walletName = name || keystore.defaultWallet;
  if (!walletName) {
    throw new Error('No wallet specified and no default wallet set');
  }
  
  const wallet = keystore.wallets.find(w => w.name === walletName);
  if (!wallet) {
    throw new Error(`Wallet "${walletName}" not found`);
  }
  
  return {
    name: wallet.name,
    privateKey: decryptPrivateKey(wallet.encryptedKey, masterKey),
    createdAt: wallet.createdAt
  };
}

/**
 * Get default wallet
 */
function getDefaultWallet() {
  const keystore = loadKeystore();
  if (!keystore.defaultWallet) {
    return null;
  }
  return getWallet(keystore.defaultWallet);
}

/**
 * List all wallets (without keys)
 */
function listWallets() {
  const keystore = loadKeystore();
  return keystore.wallets.map(w => ({
    name: w.name,
    createdAt: w.createdAt,
    isDefault: w.name === keystore.defaultWallet
  }));
}

/**
 * Remove a wallet
 */
function removeWallet(name) {
  const keystore = loadKeystore();
  keystore.wallets = keystore.wallets.filter(w => w.name !== name);
  
  if (keystore.defaultWallet === name) {
    keystore.defaultWallet = keystore.wallets[0]?.name || null;
  }
  
  saveKeystore(keystore);
}

/**
 * Set default wallet
 */
function setDefaultWallet(name) {
  const keystore = loadKeystore();
  
  if (!keystore.wallets.find(w => w.name === name)) {
    throw new Error(`Wallet "${name}" not found`);
  }
  
  keystore.defaultWallet = name;
  saveKeystore(keystore);
}

/**
 * Initialize with environment variable if available
 */
function initFromEnv() {
  const envKey = process.env.APTOS_PRIVATE_KEY;
  if (envKey) {
    try {
      addWallet('env-wallet', envKey, true);
      return true;
    } catch (e) {
      console.error('Failed to import wallet from environment:', e.message);
    }
  }
  return false;
}

module.exports = {
  addWallet,
  getWallet,
  getDefaultWallet,
  listWallets,
  removeWallet,
  setDefaultWallet,
  initFromEnv,
  loadKeystore
};