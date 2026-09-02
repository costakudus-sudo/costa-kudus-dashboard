"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  CreditCard,
  TrendingUp,
  CalendarDays,
  ArrowRight,
  Plus,
  FileText,
  BarChart3,
} from "lucide-react";


import { getClients } from "../lib/clientService";
import { getJobs } from "../lib/jobService";
import { getInvoices } from "../lib/invoiceService";

export default function Home() {
  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [clientData, jobData, invoiceData] =
          await Promise.all([
            getClients(),
            getJobs(),
            getInvoices(),
          ]);

        setClients(clientData);
        setJobs(jobData);
        setInvoices(invoiceData);
      } catch (error) {
        console.error(
          "Error loading dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =========================
     CLIENT STATISTICS
  ========================= */

  const totalClients = clients.length;

  /* =========================
     JOB STATISTICS
  ========================= */

  const totalJobs = jobs.length;

  const completedJobs = jobs.filter(
    (job) => job.jobStatus === "Completed"
  ).length;

  const pendingJobs = jobs.filter(
    (job) => job.jobStatus === "Pending"
  ).length;

  const inProgressJobs = jobs.filter(
    (job) => job.jobStatus === "In Progress"
  ).length;

  const activeJobs =
    pendingJobs + inProgressJobs;

  /* =========================
     FINANCIAL STATISTICS
  ========================= */

  const totalRevenue = invoices.reduce(
    (total, invoice) =>
      total + Number(invoice.amount || 0),
    0
  );

  const paidAmount = invoices
    .filter(
      (invoice) =>
        invoice.paymentStatus === "Paid"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const outstandingAmount = invoices
    .filter(
      (invoice) =>
        invoice.paymentStatus !== "Paid"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  /* =========================
     TODAY'S DATE
  ========================= */

  const today = new Date();

  const todayString =
    today.toISOString().split("T")[0];

  /* =========================
     TODAY'S JOBS
  ========================= */

  const todaysJobs = jobs.filter((job) => {
    if (!job.scheduledDate) return false;

    return job.scheduledDate === todayString;
  });

  /* =========================
     UPCOMING JOBS
  ========================= */

  const upcomingJobs = jobs
    .filter((job) => {
      if (!job.scheduledDate) return false;

      return job.scheduledDate > todayString;
    })
    .sort((a, b) =>
      String(a.scheduledDate).localeCompare(
        String(b.scheduledDate)
      )
    )
    .slice(0, 5);

  /* =========================
     RECENT JOBS
  ========================= */

  const recentJobs = [...jobs]
    .reverse()
    .slice(0, 5);

  /* =========================
     ANALYTICS
  ========================= */

  const monthlyRevenue = Array.from(
    { length: 6 },
    (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));

      const year = date.getFullYear();
      const month = date.getMonth();

      const revenue = invoices
        .filter((invoice) => {
          const createdAt = invoice.createdAt;

          if (!createdAt) return false;

          let invoiceDate: Date;

          if (
            typeof createdAt?.toDate === "function"
          ) {
            invoiceDate = createdAt.toDate();
          } else if (
            createdAt?.seconds
          ) {
            invoiceDate = new Date(
              createdAt.seconds * 1000
            );
          } else {
            invoiceDate = new Date(createdAt);
          }

          if (Number.isNaN(invoiceDate.getTime())) {
            return false;
          }

          return (
            invoiceDate.getFullYear() === year &&
            invoiceDate.getMonth() === month
          );
        })
        .reduce(
          (total, invoice) =>
            total + Number(invoice.amount || 0),
          0
        );

      return {
        label: date.toLocaleDateString(
          "en-GH",
          { month: "short" }
        ),
        revenue,
      };
    }
  );

  const maxMonthlyRevenue = Math.max(
    ...monthlyRevenue.map(
      (item) => item.revenue
    ),
    1
  );

  const serviceMap: Record<
    string,
    { count: number; revenue: number }
  > = {};

  invoices.forEach((invoice) => {
    const service =
      invoice.service || "Other";

    if (!serviceMap[service]) {
      serviceMap[service] = {
        count: 0,
        revenue: 0,
      };
    }

    serviceMap[service].count += 1;
    serviceMap[service].revenue += Number(
      invoice.amount || 0
    );
  });

  const topServices = Object.entries(
    serviceMap
  )
    .map(([service, data]) => ({
      service,
      ...data,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return b.revenue - a.revenue;
    })
    .slice(0, 5);

  if (loading) {
    return (
<div className="flex-1">

  <section className="w-full">

    {/* =========================
        WELCOME
    ========================= */}

          <div className="flex min-h-[60vh] items-center justify-center">

            <p className="text-slate-500">
              Loading dashboard...
            </p>

          </div>

        </section>

      </div>
    );
  }

return (
  <div className="flex-1">

    <section className="w-full">

      {/* =========================
          WELCOME
      ========================= */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-800">
            Business Dashboard
          </h1>

          <p className="mt-1 text-slate-500">
            Welcome to Costa Kudus Tech Business Management System.
          </p>

        </div>

        {/* =========================
            STATISTICS
        ========================= */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* CLIENTS */}

          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">

            <Users size={32} />

            <p className="mt-4 text-sm text-blue-100">
              Total Clients
            </p>

            <h2 className="mt-1 text-4xl font-bold">
              {totalClients}
            </h2>

            <Link
              href="/clients"
              className="mt-4 flex items-center gap-2 text-sm text-blue-100 hover:text-white"
            >
              View Clients
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* JOBS */}

          <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">

            <Briefcase size={32} />

            <p className="mt-4 text-sm text-orange-100">
              Total Jobs
            </p>

            <h2 className="mt-1 text-4xl font-bold">
              {totalJobs}
            </h2>

            <Link
              href="/jobs"
              className="mt-4 flex items-center gap-2 text-sm text-orange-100 hover:text-white"
            >
              View Jobs
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* REVENUE */}

          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg">

            <TrendingUp size={32} />

            <p className="mt-4 text-sm text-green-100">
              Total Revenue
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              GH₵ {totalRevenue.toFixed(2)}
            </h2>

            <Link
              href="/reports"
              className="mt-4 flex items-center gap-2 text-sm text-green-100 hover:text-white"
            >
              View Reports
              <ArrowRight size={16} />
            </Link>

          </div>

          {/* OUTSTANDING */}

          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-lg">

            <CreditCard size={32} />

            <p className="mt-4 text-sm text-purple-100">
              Outstanding Payments
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              GH₵ {outstandingAmount.toFixed(2)}
            </h2>

            <Link
              href="/payments"
              className="mt-4 flex items-center gap-2 text-sm text-purple-100 hover:text-white"
            >
              View Payments
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>

        {/* =========================
            SECONDARY STATISTICS
        ========================= */}

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-green-100 p-3">
                <CheckCircle
                  className="text-green-600"
                  size={22}
                />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Completed Jobs
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {completedJobs}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-yellow-100 p-3">
                <Clock
                  className="text-yellow-600"
                  size={22}
                />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Active Jobs
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  {activeJobs}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-blue-100 p-3">
                <CreditCard
                  className="text-blue-600"
                  size={22}
                />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Paid Revenue
                </p>

                <p className="text-2xl font-bold text-slate-800">
                  GH₵ {paidAmount.toFixed(2)}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            ANALYTICS
        ========================= */}

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* MONTHLY REVENUE */}

          <div className="xl:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-emerald-100 p-2">
                    <BarChart3
                      className="text-emerald-600"
                      size={22}
                    />
                  </div>

                  <h2 className="text-xl font-bold text-slate-800">
                    Revenue Overview
                  </h2>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Revenue generated over the last six months
                </p>
              </div>

              <Link
                href="/reports"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Full Report
              </Link>

            </div>

            <div className="flex h-64 items-end gap-3 border-b border-slate-200 px-2 pb-2">

              {monthlyRevenue.map((item) => {

                const height =
                  item.revenue === 0
                    ? 4
                    : Math.max(
                        8,
                        (item.revenue /
                          maxMonthlyRevenue) *
                          100
                      );

                return (
                  <div
                    key={item.label}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >

                    <span className="text-xs font-medium text-slate-500">
                      GH₵{" "}
                      {item.revenue.toFixed(0)}
                    </span>

                    <div
                      className="w-full max-w-12 rounded-t-lg bg-emerald-500 transition-all hover:bg-emerald-600"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`GH₵ ${item.revenue.toFixed(2)}`}
                    />

                    <span className="text-xs font-medium text-slate-500">
                      {item.label}
                    </span>

                  </div>
                );
              })}

            </div>

          </div>

          {/* TOP SERVICES */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-purple-100 p-2">
                  <TrendingUp
                    className="text-purple-600"
                    size={22}
                  />
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                  Top Services
                </h2>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Most requested services
              </p>

            </div>

            {topServices.length === 0 ? (

              <div className="py-10 text-center">
                <p className="text-slate-500">
                  No service data available yet.
                </p>
              </div>

            ) : (

              <div className="space-y-4">

                {topServices.map(
                  (item, index) => (

                    <div
                      key={item.service}
                      className="flex items-center justify-between gap-3"
                    >

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {index + 1}
                          </span>

                          <p className="truncate font-medium text-slate-800">
                            {item.service}
                          </p>

                        </div>

                        <p className="ml-9 mt-1 text-xs text-slate-500">
                          {item.count}{" "}
                          {item.count === 1
                            ? "invoice"
                            : "invoices"}
                        </p>

                      </div>

                      <p className="shrink-0 font-semibold text-emerald-600">
                        GH₵{" "}
                        {item.revenue.toFixed(2)}
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

        {/* =========================
            MAIN CONTENT
        ========================= */}

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* UPCOMING JOBS */}

          <div className="xl:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <CalendarDays
                    className="text-blue-600"
                    size={24}
                  />

                  <h2 className="text-xl font-bold text-slate-800">
                    Upcoming Jobs
                  </h2>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Jobs scheduled for upcoming dates
                </p>

              </div>

              <Link
                href="/calendar"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Calendar
              </Link>

            </div>

            {upcomingJobs.length === 0 ? (

              <div className="rounded-xl bg-slate-50 p-8 text-center">

                <CalendarDays
                  className="mx-auto mb-3 text-slate-300"
                  size={40}
                />

                <p className="text-slate-500">
                  No upcoming jobs scheduled.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {upcomingJobs.map((job) => (

                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-xl border p-4 hover:bg-slate-50"
                  >

                    <div>

                      <p className="font-semibold text-slate-800">
                        {job.clientName ||
                          "Client"}
                      </p>

                      <p className="text-sm text-slate-500">
                        {job.service ||
                          "Service"}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="font-semibold text-blue-600">
                        {new Date(
                          `${job.scheduledDate}T00:00:00`
                        ).toLocaleDateString(
                          "en-GH",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </p>

                      <span className="text-xs text-slate-500">
                        {job.jobStatus}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* TODAY'S JOBS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <CalendarDays
                className="text-orange-500"
                size={24}
              />

              <h2 className="text-xl font-bold text-slate-800">
                Today's Jobs
              </h2>

            </div>

            {todaysJobs.length === 0 ? (

              <div className="py-8 text-center">

                <p className="text-slate-500">
                  No jobs scheduled for today.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {todaysJobs.map((job) => (

                  <div
                    key={job.id}
                    className="rounded-xl bg-orange-50 p-4"
                  >

                    <p className="font-semibold text-slate-800">
                      {job.clientName ||
                        "Client"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {job.service}
                    </p>

                    <span className="mt-2 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                      {job.jobStatus}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

        {/* =========================
            RECENT JOBS + QUICK ACTIONS
        ========================= */}

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* RECENT JOBS */}

          <div className="xl:col-span-2 rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Recent Jobs
                </h2>

                <p className="text-sm text-slate-500">
                  Latest jobs entered into the system
                </p>

              </div>

              <Link
                href="/jobs"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>

            </div>

            {recentJobs.length === 0 ? (

              <div className="py-8 text-center text-slate-500">
                No jobs available yet.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="border-b text-left text-sm text-slate-500">

                      <th className="pb-3">
                        Client
                      </th>

                      <th className="pb-3">
                        Service
                      </th>

                      <th className="pb-3">
                        Amount
                      </th>

                      <th className="pb-3">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {recentJobs.map((job) => (

                      <tr
                        key={job.id}
                        className="border-b last:border-0"
                      >

                        <td className="py-4 font-medium">
                          {job.clientName ||
                            "Client"}
                        </td>

                        <td className="py-4 text-slate-500">
                          {job.service}
                        </td>

                        <td className="py-4 font-medium">
                          GH₵{" "}
                          {Number(
                            job.amount || 0
                          ).toFixed(2)}
                        </td>

                        <td className="py-4">

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            {job.jobStatus}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* QUICK ACTIONS */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-bold text-slate-800">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 gap-3">

              <Link
                href="/clients"
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-blue-600 p-4 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                <Users size={22} />
                Clients
              </Link>

              <Link
                href="/jobs"
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-orange-500 p-4 text-center text-sm font-medium text-white hover:bg-orange-600"
              >
                <Briefcase size={22} />
                Jobs
              </Link>

              <Link
                href="/invoices"
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-emerald-600 p-4 text-center text-sm font-medium text-white hover:bg-emerald-700"
              >
                <FileText size={22} />
                Invoice
              </Link>

              <Link
                href="/payments"
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-purple-600 p-4 text-center text-sm font-medium text-white hover:bg-purple-700"
              >
                <CreditCard size={22} />
                Payment
              </Link>

            </div>

            <Link
              href="/reports"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <TrendingUp size={18} />
              Business Reports
            </Link>

          </div>

        </div>

        {/* =========================
            FOOTER SUMMARY
        ========================= */}

        <div className="mt-8 rounded-2xl bg-slate-900 p-8 text-white shadow-lg">

          <div className="flex items-center gap-3">

            <TrendingUp size={28} />

            <div>

              <h2 className="text-2xl font-bold">
                Costa Kudus Tech
              </h2>

              <p className="text-sm text-slate-400">
                Business performance at a glance
              </p>

            </div>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">

            <div>
              <p className="text-sm text-slate-400">
                Clients
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totalClients}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Total Jobs
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totalJobs}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Completed
              </p>

              <p className="mt-1 text-3xl font-bold">
                {completedJobs}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Revenue
              </p>

              <p className="mt-1 text-3xl font-bold">
                GH₵ {totalRevenue.toFixed(2)}
              </p>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}