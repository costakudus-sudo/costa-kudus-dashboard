"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Customer portal is public.
    // Customers access it using their unique portal token.
    if (pathname.startsWith("/customer/")) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && pathname !== "/login") {
        router.replace("/login");
        return;
      }

      if (user && pathname === "/login") {
        router.replace("/");
        return;
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Customer portal does not need admin authentication.
  if (pathname.startsWith("/customer/")) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900">
            Costa Kudus Tech
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}