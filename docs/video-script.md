# 🎬 ASCENT CLI - Hackathon Demo Video Script
## Canteen x Aptos x402 Hackathon 2026
### Duration: 3-4 Minutes
### Format: Screen Recording + Voiceover

---

## OPENING HOOK (0:00 - 0:20)
**[Visual: Terminal screen with Ascent ASCII banner]**

**VOICEOVER:**
"What if every API call between AI agents was a paid transaction? Not tomorrow. Today. I'm Ihab Heb, and this is Ascent — the first CLI that forges autonomous agents with native x402 payment rails on Aptos."

**[Transition: Quick cut to CLI animation]**

---

## THE PROBLEM (0:20 - 0:45)
**[Visual: Split screen - left: traditional API mess, right: clean x402 flow]**

**VOICEOVER:**
"We're entering the Agentic Era. AI agents will make billions of API calls daily. But there's a problem — there's no native way for agents to pay each other. We have OAuth, API keys, rate limits... but no payment-at-the-protocol-layer."

**[Visual: Show current pain points - API key management, billing dashboards, subscription fatigue]**

"Enter x402. HTTP 402 Payment Required — resurrected for the agent economy."

---

## THE SOLUTION (0:45 - 1:30)
**[Visual: Terminal - typing "ascent init my-agent --template express"]**

**VOICEOVER:**
"Ascent is a forge for agent developers. One command scaffolds a complete x402-enabled server. Let me show you."

**[Live Demo: Interactive Setup]**
```bash
$ ascent init agent-forge --template express
✓ Express template selected
✓ Interactive configuration
✓ Dependencies installed
✓ Environment configured
```

**VOICEOVER:**
"We built interactive setup with zero-config defaults. It detects your environment, suggests optimal settings, and gets you from zero to deployed in under 60 seconds."

**[Visual: Show the generated project structure]**

---

## LIVE DEMONSTRATION (1:30 - 2:45)
**[Visual: Terminal split - top: server logs, bottom: test execution]**

**VOICEOVER:**
"Watch this. I'm starting the development environment..."

**[Type: ascent dev]**
```bash
$ ascent dev
🔥 Ascent Development Environment starting...
✓ Local facilitator running on http://localhost:4022
✓ Agent server active on port 3006
```

**VOICEOVER:**
"The local facilitator and agent server are now running in sync. Now for the magic — let's test with multiple wallets simultaneously."

**[Type: ascent test --all-wallets]**
```bash
$ ascent test --all-wallets --endpoint http://localhost:3006/api/paid-endpoint
🧪 Ascent Multi-Wallet Stress Test

Wallet 1 (Egg #2)     ✓ FORGED    TX: 0x7a3f...     0.01 USDC
Wallet 2              ✓ FORGED    TX: 0x9b2e...     0.01 USDC
Wallet 3              ✓ FORGED    TX: 0x4c8d...     0.01 USDC
Wallet 4              ✓ FORGED    TX: 0x1f5a...     0.01 USDC
Wallet 5              ✓ FORGED    TX: 0x6d9b...     0.01 USDC

Success Rate: 100%    |    Volume: 0.05 USDC
```

**VOICEOVER:**
"Five wallets. Five transactions. One command. This is how we test agent commerce at scale. Each payment is cryptographically signed, verified by the facilitator, and settled on Aptos testnet."

---

## UNIQUE FEATURES (2:45 - 3:20)
**[Visual: Dashboard screen with analytics]**

**VOICEOVER:**
"But Ascent isn't just a test tool. It's a complete ecosystem."

**[Show: ascent dashboard]**
"The analytics dashboard tracks every transaction, builds agent reputation scores, and visualizes payment flows in real-time."

**[Show: Agent Identity System]**
"We implemented AAIS — Agent Identity & Reputation. Every agent gets a trust score based on payment history. This is critical for autonomous commerce."

**[Show: Move module generation]**
"And for Aptos developers — `ascent move` generates ready-to-deploy verification modules. The CLI bridges Web2 agent frameworks with Web3 settlement."

---

## EASTEREGB BONUS (3:20 - 3:40)
**[Visual: Quick flash of easter egg discovery]**

**VOICEOVER:**
"Oh, and we found the easter eggs. GOLDEN-COOKIE-X402-9F3A and decoded the XOR cipher for 'X402 IS MAGIC'. Because attention to detail matters — in code and in community engagement."

---

## CLOSING (3:40 - 4:00)
**[Visual: GitHub repo, docs, final banner]**

**VOICEOVER:**
"Ascent CLI. Forging the future of agent commerce. Built for the Canteen x Aptos x402 Hackathon. Open source. Production-ready. Ready to ship."

**[Text on screen: github.com/Hebx/ascent-cli]**

**VOICEOVER:**
"Clone it. Forge something. Welcome to the agent economy."

**[End: Ascent logo with purple/teal gradient fade]**

---

## TECHNICAL NOTES FOR RECORDING:
- Use terminal with dark background, green/monospace text
- Keep font size large (readable at 1080p)
- Add subtle keystroke sound effects
- Background music: ambient electronic, low volume
- Transition effects: quick cuts, no fades longer than 0.3s
- Highlight cursor with yellow glow for visibility

## KEY METRICS TO MENTION:
- 6 core commands
- 5 hackathon wallets tested
- 100% E2E validation
- Zero-config setup
- Aptos testnet integration
