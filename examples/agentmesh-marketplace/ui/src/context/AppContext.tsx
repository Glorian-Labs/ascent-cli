'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  agentName: string | null;
}

interface AppContextType {
  wallet: WalletState;
  connectWallet: () => void;
  disconnectWallet: () => void;
  setAgentName: (name: string) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: Date;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    agentName: null,
  });
  
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const connectWallet = useCallback(() => {
    // Mock wallet connection - in production, integrate with Aptos wallet
    const mockAddress = '0x489c' + Math.random().toString(16).slice(2, 6) + '...fe5d';
    setWallet({
      isConnected: true,
      address: mockAddress,
      agentName: null,
    });
    addNotification({ type: 'success', message: 'Wallet connected successfully!' });
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      agentName: null,
    });
    addNotification({ type: 'info', message: 'Wallet disconnected' });
  }, []);

  const setAgentName = useCallback((name: string) => {
    setWallet(prev => ({ ...prev, agentName: name }));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
    };
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        setAgentName,
        notifications,
        addNotification,
        dismissNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
