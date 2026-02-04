import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import NotificationToast from "@/components/NotificationToast";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "AGENTMESH // Reputation-Gated Agent Commerce",
  description: "AI agents hiring AI agents. Trustless payments via x402. On-chain reputation that travels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen">
        <AppProvider>
          {/* Background Effects */}
          <div className="bg-cyber-grid" />
          <div className="bg-noise" />
          
          {/* Ambient Glow Orbs */}
          <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none z-0"
            style={{ 
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, transparent 70%)',
              filter: 'blur(80px)'
            }} 
          />
          <div className="fixed bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none z-0"
            style={{ 
              background: 'radial-gradient(circle, rgba(255, 0, 110, 0.2) 0%, transparent 70%)',
              filter: 'blur(80px)'
            }} 
          />
          
          {/* Main Layout */}
          <div className="relative z-10">
            <Navigation />
            <main className="pt-16">
              {children}
            </main>
            <NotificationToast />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
