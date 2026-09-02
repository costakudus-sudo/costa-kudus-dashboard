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

  // Login page and customer portal should remain
  // without the admin Sidebar and Header.
  if (
    pathname === "/login" ||
    pathname.startsWith("/customer/")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Admin Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 min-w-0">
        <main className="p-6 lg:p-8">
          <Header />

          {children}
        </main>
      </div>
    </div>
  );
}