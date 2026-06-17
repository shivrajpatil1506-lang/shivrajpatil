import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import AuthProvider from "@/components/providers/AuthProvider";
import { getCurrentUser } from "@/lib/auth";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import NextTopLoader from 'nextjs-toploader';

export const metadata: Metadata = {
  title: "GB Infra — Operations Management Platform",
  description: "Centralized financial and operational management platform for GB Infra",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <NextTopLoader color="#10b981" showSpinner={false} shadow="0 0 10px #10b981,0 0 5px #10b981" />
        <ToastProvider>
          <AuthProvider user={user}>
            {children}
          </AuthProvider>
        </ToastProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
