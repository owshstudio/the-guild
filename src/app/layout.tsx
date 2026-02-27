import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/sidebar";
import { DataProvider } from "@/lib/data/data-provider";
import { ToastProvider } from "@/components/toast-provider";
import { DispatchProvider } from "@/components/dispatch/dispatch-provider";
import { BudgetAlertBanner } from "@/components/budget/budget-alert-banner";
import GatewayBanner from "@/components/gateway-banner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Guild — Agent Dashboard",
  description: "AI agent management dashboard for OpenClaw",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-[#e5e5e5]`}
      >
        <DataProvider>
          <ToastProvider>
            <DispatchProvider>
              <Sidebar />
              <main className="ml-60 min-h-screen">
                <GatewayBanner />
                <BudgetAlertBanner />
                {children}
              </main>
            </DispatchProvider>
          </ToastProvider>
        </DataProvider>
      </body>
    </html>
  );
}
