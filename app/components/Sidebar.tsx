"use client";

import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CreditCard,
  FileText,
  BarChart3,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react";

const menu = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-[#08142D] text-white flex flex-col">

      {/* Logo */}

      <div className="p-6 border-b border-slate-700">

        <div className="flex items-center gap-4">

          <Image
            src="/logo.png"
            alt="Costa Kudus Tech"
            width={65}
            height={65}
            className="rounded-xl bg-white p-1"
          />

          <div>

            <h1 className="text-xl font-bold">
              Costa Kudus Tech
            </h1>

            <p className="text-sm text-slate-400">
              Business Management System
            </p>

          </div>

        </div>

      </div>

      {/* Menu */}

      <div className="flex-1 px-4 py-6">

        <p className="text-xs uppercase text-slate-500 mb-4 tracking-widest">
          Main Menu
        </p>

        <div className="space-y-2">

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-4 rounded-xl px-5 py-4 hover:bg-blue-600 transition-all duration-300"
              >
                <Icon size={22} />

                <span className="font-medium">
                  {item.title}
                </span>

              </Link>
            );
          })}

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-slate-700 p-5">

        <button className="flex items-center gap-3 text-red-300 hover:text-white transition">

          <LogOut size={20} />

          Logout

        </button>

        <div className="mt-5 text-xs text-slate-500">

          Version 1.0

          <br />

          Powered by AI

        </div>

      </div>

    </aside>
  );
}