"use client";

import {
  Users,
  ClipboardList,
  CreditCard,
  FileText,
  Printer,
  Camera,
  TrendingUp,
  Wallet,
} from "lucide-react";

const cards = [
  {
    title: "Total Clients",
    value: "245",
    change: "+12%",
    color: "from-blue-600 to-cyan-500",
    icon: Users,
  },
  {
    title: "Active Tasks",
    value: "48",
    change: "+5%",
    color: "from-emerald-600 to-green-500",
    icon: ClipboardList,
  },
  {
    title: "Revenue",
    value: "₵18,450",
    change: "+18%",
    color: "from-indigo-600 to-blue-500",
    icon: Wallet,
  },
  {
    title: "Invoices",
    value: "132",
    change: "+10%",
    color: "from-orange-500 to-amber-400",
    icon: FileText,
  },
  {
    title: "Payments",
    value: "₵9,850",
    change: "+8%",
    color: "from-red-500 to-pink-500",
    icon: CreditCard,
  },
  {
    title: "Printing Jobs",
    value: "67",
    change: "+20%",
    color: "from-sky-500 to-cyan-400",
    icon: Printer,
  },
  {
    title: "Passport Photos",
    value: "35",
    change: "+7%",
    color: "from-purple-600 to-fuchsia-500",
    icon: Camera,
  },
  {
    title: "Business Growth",
    value: "92%",
    change: "+14%",
    color: "from-emerald-500 to-lime-400",
    icon: TrendingUp,
  },
];

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className={`bg-gradient-to-r ${card.color} rounded-3xl p-6 text-white shadow-xl hover:scale-[1.03] transition-all duration-300`}
          >
            <div className="flex justify-between items-center">

              <div>

                <p className="text-sm opacity-90">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold mt-3">
                  {card.value}
                </h2>

                <span className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block mt-4">
                  {card.change} this month
                </span>

              </div>

              <div className="bg-white/20 p-4 rounded-2xl">
                <Icon size={34} />
              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}