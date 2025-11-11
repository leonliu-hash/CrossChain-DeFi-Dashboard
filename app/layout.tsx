import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cross-Chain DeFi Dashboard",
  description: "A lightweight Next.js dashboard demonstrating cross-chain quotes, balances, and ROI analytics."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
