"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Login, customer portal, and public job tracking
  // must remain standalone without the admin Sidebar and Header.
  if (
    pathname === "/login" ||
    pathname.startsWith("/customer/") ||
    pathname.startsWith("/track/")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}