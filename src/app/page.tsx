"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function Home() {

  const [clientCount, setClientCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {

    // Clients
    const clientSnapshot = await getDocs(
      collection(db, "clients")
    );

    setClientCount(clientSnapshot.size);

    // Tasks
    const taskSnapshot = await getDocs(
      collection(db, "tasks")
    );

    setTaskCount(taskSnapshot.size);

    // Completed Tasks
    const completedTasks = taskSnapshot.docs.filter(
      (doc) => doc.data().status === "Completed"
    );

    setCompletedCount(completedTasks.length);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <main className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 hidden md:block">

        <h1 className="text-2xl font-bold mb-10">
          COSTA KUDUS TECH
        </h1>

        <nav className="space-y-4">

          <Link
            href="/"
            className="bg-blue-700 p-3 rounded-xl block"
          >
            Dashboard
          </Link>

          <Link
            href="/clients"
            className="hover:bg-blue-700 p-3 rounded-xl block"
          >
            Clients
          </Link>

          <Link
            href="/tasks"
            className="hover:bg-blue-700 p-3 rounded-xl block"
          >
            Tasks
          </Link>

          <div className="hover:bg-blue-700 p-3 rounded-xl cursor-pointer">
            Payments
          </div>

          <div className="hover:bg-blue-700 p-3 rounded-xl cursor-pointer">
            Reports
          </div>

          <div className="hover:bg-blue-700 p-3 rounded-xl cursor-pointer">
            Settings
          </div>

        </nav>

      </aside>

      {/* Main Content */}
      <section className="flex-1 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Dashboard
            </h2>

            <p className="text-gray-500">
              Welcome back, Admin
            </p>
          </div>

          <Link
            href="/tasks"
            className="bg-blue-700 text-white px-5 py-3 rounded-xl shadow-md hover:bg-blue-800"
          >
            + New Task
          </Link>

        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-gray-500">
              Clients
            </h3>

            <p className="text-4xl font-bold mt-3">
              {clientCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-gray-500">
              Active Tasks
            </h3>

            <p className="text-4xl font-bold mt-3">
              {taskCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-gray-500">
              Completed
            </h3>

            <p className="text-4xl font-bold mt-3">
              {completedCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h3 className="text-gray-500">
              Revenue
            </h3>

            <p className="text-4xl font-bold mt-3">
              GH₵ 0
            </p>
          </div>

        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-md p-6 mt-10">

          <h2 className="text-2xl font-semibold mb-5">
            Recent Activities
          </h2>

          <div className="space-y-4">

            <div className="border-b pb-3">
              Dashboard connected successfully
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}