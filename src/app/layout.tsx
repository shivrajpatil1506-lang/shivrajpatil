import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import AuthProvider from "@/components/providers/AuthProvider";
import { getCurrentUser } from "@/lib/auth";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "GB Infra — Operations Management Platform",
  description: "Centralized financial and operational management platform for GB Infra",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider user={user}>
            {children}
          </AuthProvider>
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
