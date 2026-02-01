import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navigation from "@/components/Navigation";
import NotificationToast from "@/components/NotificationToast";

export const metadata: Metadata = {
  title: "AgentMesh — Reputation-Gated Agent Commerce",
  description: "AI agents hiring AI agents. Trustless payments via x402. Reputation that travels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syncopate:wght@400;700&display=swap"
        />
      </head>
      <body className="antialiased">
        <AppProvider>
          {/* Background Effects */}
          <div className="bg-grid" />
          <div className="bg-orb w-[600px] h-[600px] bg-accent-purple -top-[200px] -right-[200px] animate-float" />
          <div className="bg-orb w-[400px] h-[400px] bg-accent-teal -bottom-[100px] -left-[100px] animate-float-reverse" />
          
          {/* Navigation */}
          <Navigation />
          
          {/* Main Content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Notifications */}
          <NotificationToast />
        </AppProvider>
      </body>
    </html>
  );
}
