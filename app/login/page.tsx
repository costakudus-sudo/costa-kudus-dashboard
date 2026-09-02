"use client";

import { FormEvent, useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
   } catch (error: unknown) {
      console.error("LOGIN ERROR:", error);
      const firebaseError = error as { code?: string };
      setError(firebaseError.code || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email address first.");
      setSuccess("");
      return;
    }

    setError("");
    setSuccess("");
    setResetting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(
        "Password reset link sent. Please check your email."
      );
    } catch (error: any) {
      console.error("PASSWORD RESET ERROR:", error);
      setError(
        error?.code || "Unable to send password reset email."
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:28px_28px]" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">

          {/* Header */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 px-8 py-10 text-center text-white">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold shadow-lg ring-1 ring-white/20">
              CK
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Costa Kudus Tech
            </h1>

            <p className="mt-2 text-sm text-blue-100">
              Business Management Portal
            </p>

          </div>

          {/* Form */}
          <div className="px-8 py-8">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                Admin Sign In
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Sign in to manage your business.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetting}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50"
                  >
                    {resetting
                      ? "Sending reset link..."
                      : "Forgot password?"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>

            {/* Footer */}
            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} Costa Kudus Tech
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Authorized personnel only
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}