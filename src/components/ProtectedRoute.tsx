"use client";

import { useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {

        if (!user) {
          router.push("/login");
        } else {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();

  }, [router]);

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}