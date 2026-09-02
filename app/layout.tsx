import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "./components/AuthGuard";
import AppShell from "./components/AppShell";

export const metadata: Metadata = {
  title: "Costa Kudus Tech",
  description: "Business Management Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AuthGuard>
          <AppShell>{children}</AppShell>
        </AuthGuard>
      </body>
    </html>
  );
}