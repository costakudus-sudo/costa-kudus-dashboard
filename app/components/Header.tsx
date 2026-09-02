"use client";

import { useEffect, useState } from "react";
import { Bell, Search, CalendarDays, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Header() {
  const [dateTime, setDateTime] = useState("");
  const router = useRouter();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setDateTime(
        now.toLocaleString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateClock();

    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-5 mb-8">
      <div className="flex items-center justify-between">

        {/* Left Side */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Welcome back to Costa Kudus Tech
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search..."
              className="pl-11 pr-4 py-3 w-72 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notification */}
          <button className="relative bg-slate-100 p-3 rounded-xl hover:bg-slate-200">
            <Bell size={20} />

            <span className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </button>

          {/* Date */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3">
            <CalendarDays size={18} />

            <span className="text-sm font-medium">
              {dateTime}
            </span>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2">
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              AK
            </div>

            <div>
              <h3 className="font-semibold">
                Abdul Kudus
              </h3>

              <p className="text-xs text-green-600">
                System Administrator
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-5 py-3 flex items-center gap-2 transition"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </div>
    </header>
  );
}