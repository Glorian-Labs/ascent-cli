import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {/* Background Effects */}
        <div className="bg-grid" />
        <div className="bg-orb w-[600px] h-[600px] bg-accent-purple -top-[200px] -right-[200px] animate-float" />
        <div className="bg-orb w-[400px] h-[400px] bg-accent-teal -bottom-[100px] -left-[100px] animate-float-reverse" />
        
        {/* Main Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
