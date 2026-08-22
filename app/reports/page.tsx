"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Briefcase,
  FileText,
  CreditCard,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  BarChart3,
  CalendarDays,
} from "lucide-react";

import { getClients } from "../../lib/clientService";
import { getJobs } from "../../lib/jobService";
import { getInvoices } from "../../lib/invoiceService";

export default function ReportsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);

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
        console.error("Error loading reports:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  // ============================
  // DATE FILTERING
  // ============================

  const getRecordDate = (value: any): Date | null => {
    if (!value) return null;

    try {
      if (typeof value?.toDate === "function") {
        const date = value.toDate();
        return Number.isNaN(date.getTime()) ? null : date;
      }

      if (value?.seconds) {
        const date = new Date(value.seconds * 1000);
        return Number.isNaN(date.getTime()) ? null : date;
      }

      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const startOfDay = (date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const endOfDay = (date: Date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  };

  const getFilterRange = (): {
    start: Date | null;
    end: Date | null;
  } => {
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
        };

      case "week": {
        const start = new Date(now);
        const day = start.getDay();
        const difference = day === 0 ? 6 : day - 1;
        start.setDate(start.getDate() - difference);

        return {
          start: startOfDay(start),
          end: endOfDay(now),
        };
      }

      case "month":
        return {
          start: startOfDay(
            new Date(now.getFullYear(), now.getMonth(), 1)
          ),
          end: endOfDay(now),
        };

      case "lastMonth": {
        const start = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const end = new Date(
          now.getFullYear(),
          now.getMonth(),
          0
        );

        return {
          start: startOfDay(start),
          end: endOfDay(end),
        };
      }

      case "year":
        return {
          start: startOfDay(
            new Date(now.getFullYear(), 0, 1)
          ),
          end: endOfDay(now),
        };

      case "custom": {
        if (!customStartDate && !customEndDate) {
          return { start: null, end: null };
        }

        const start = customStartDate
          ? startOfDay(new Date(`${customStartDate}T00:00:00`))
          : null;

        const end = customEndDate
          ? endOfDay(new Date(`${customEndDate}T00:00:00`))
          : null;

        return { start, end };
      }

      default:
        return { start: null, end: null };
    }
  };

  const filterRange = getFilterRange();

  const isWithinRange = (
    value: any,
    range = filterRange
  ) => {
    if (!range.start && !range.end) return true;

    const date = getRecordDate(value);

    // If a record has no usable date, keep it visible only when
    // the report is set to All Time. Date-filtered reports exclude it.
    if (!date) return false;

    if (range.start && date < range.start) return false;
    if (range.end && date > range.end) return false;

    return true;
  };

  const filteredInvoices = invoices.filter((invoice) =>
    isWithinRange(invoice.createdAt)
  );

  const filteredJobs = jobs.filter((job) =>
    isWithinRange(
      job.createdAt || job.updatedAt || job.scheduledDate
    )
  );

  const filteredClients = clients.filter((client) =>
    isWithinRange(client.createdAt || client.updatedAt)
  );

  // ============================
  // CLIENT STATISTICS
  // ============================

  // Clients without a date are still included in All Time.
  const totalClients =
    dateFilter === "all"
      ? clients.length
      : filteredClients.length;

  // ============================
  // JOB STATISTICS
  // ============================

  const totalJobs = filteredJobs.length;

  const completedJobs = filteredJobs.filter(
    (job) => job.jobStatus === "Completed"
  ).length;

  const pendingJobs = filteredJobs.filter(
    (job) => job.jobStatus === "Pending"
  ).length;

  const inProgressJobs = filteredJobs.filter(
    (job) => job.jobStatus === "In Progress"
  ).length;

  const cancelledJobs = filteredJobs.filter(
    (job) => job.jobStatus === "Cancelled"
  ).length;

  // ============================
  // INVOICE STATISTICS
  // ============================

  const totalRevenue = filteredInvoices.reduce(
    (total, invoice) =>
      total + Number(invoice.amount || 0),
    0
  );

  const paidAmount = filteredInvoices
    .filter(
      (invoice) => invoice.paymentStatus === "Paid"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const unpaidAmount = filteredInvoices
    .filter(
      (invoice) => invoice.paymentStatus === "Unpaid"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const partialAmount = filteredInvoices
    .filter(
      (invoice) => invoice.paymentStatus === "Partial"
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  // ============================
  // SERVICE ANALYSIS
  // ============================

  const serviceCounts: Record<string, number> = {};

  filteredJobs.forEach((job) => {
    const service = job.service || "Other";

    serviceCounts[service] =
      (serviceCounts[service] || 0) + 1;
  });

  const serviceList = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1]);

  // ============================
  // JOB COMPLETION RATE
  // ============================

  const completionRate =
    totalJobs > 0
      ? Math.round(
          (completedJobs / totalJobs) * 100
        )
      : 0;

  // ============================
  // MONTHLY REVENUE ANALYSIS
  // ============================

  const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));

    const revenue = filteredInvoices
      .filter((invoice) => {
        const invoiceDate = getRecordDate(invoice.createdAt);
        return (
          invoiceDate &&
          invoiceDate.getFullYear() === date.getFullYear() &&
          invoiceDate.getMonth() === date.getMonth()
        );
      })
      .reduce(
        (total, invoice) => total + Number(invoice.amount || 0),
        0
      );

    return {
      label: date.toLocaleDateString("en-GH", {
        month: "short",
        year: "numeric",
      }),
      revenue,
    };
  });

  const maxMonthlyRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
    1
  );

  // ============================
  // REVENUE BY SERVICE
  // ============================

  const serviceRevenueMap: Record<
    string,
    { count: number; revenue: number }
  > = {};

  filteredInvoices.forEach((invoice) => {
    const service = invoice.service || "Other";

    if (!serviceRevenueMap[service]) {
      serviceRevenueMap[service] = { count: 0, revenue: 0 };
    }

    serviceRevenueMap[service].count += 1;
    serviceRevenueMap[service].revenue += Number(invoice.amount || 0);
  });

  const serviceRevenueList = Object.entries(serviceRevenueMap)
    .map(([service, data]) => ({ service, ...data }))
    .sort((a, b) =>
      b.revenue !== a.revenue
        ? b.revenue - a.revenue
        : b.count - a.count
    )
    .slice(0, 8);

  // ============================
  // PRINT REPORT
  // ============================

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">
          Loading business reports...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* PRINT STYLES */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          aside,
          nav,
          header {
            display: none !important;
          }

          button,
          .print-hidden {
            display: none !important;
          }

          * {
            box-shadow: none !important;
          }

          .print-report {
            width: 100% !important;
            max-width: 100% !important;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>

      {/* REPORT */}

      <div className="print-report space-y-8">

        {/* HEADER */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Business Reports
            </h1>

            <p className="mt-1 text-slate-500">
              Overview of Costa Kudus Tech business performance.
            </p>
          </div>

          {/* PRINT BUTTON */}

          <button
            onClick={handlePrint}
            className="print-hidden flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Printer size={20} />

            Print Report
          </button>

        </div>

        {/* DATE FILTERS */}

        <div className="print-hidden rounded-2xl border bg-white p-5 shadow-sm">

          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2">
                <CalendarDays
                  className="text-blue-600"
                  size={22}
                />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Report Period
                </h2>
                <p className="text-sm text-slate-500">
                  Choose the period used for the report figures.
                </p>
              </div>
            </div>

            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);

                if (e.target.value !== "custom") {
                  setCustomStartDate("");
                  setCustomEndDate("");
                }
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>

          </div>

          {dateFilter === "custom" && (
            <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Start Date
                </label>

                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) =>
                    setCustomStartDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  End Date
                </label>

                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) =>
                    setCustomEndDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>
          )}

        </div>

        {/* MAIN STATISTICS */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* CLIENTS */}

          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">

            <Users
              size={34}
              className="mb-3"
            />

            <p>Total Clients</p>

            <h2 className="mt-2 text-4xl font-bold">
              {totalClients}
            </h2>

          </div>

          {/* JOBS */}

          <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">

            <Briefcase
              size={34}
              className="mb-3"
            />

            <p>Total Jobs</p>

            <h2 className="mt-2 text-4xl font-bold">
              {totalJobs}
            </h2>

          </div>

          {/* INVOICES */}

          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-lg">

            <FileText
              size={34}
              className="mb-3"
            />

            <p>Total Invoices</p>

            <h2 className="mt-2 text-4xl font-bold">
              {invoices.length}
            </h2>

          </div>

          {/* REVENUE */}

          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg">

            <TrendingUp
              size={34}
              className="mb-3"
            />

            <p>Total Revenue</p>

            <h2 className="mt-2 text-3xl font-bold">
              GH₵ {totalRevenue.toFixed(2)}
            </h2>

          </div>

        </div>

        {/* JOB PERFORMANCE */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <Briefcase
                className="text-blue-600"
                size={24}
              />

              <h2 className="text-xl font-bold text-slate-800">
                Job Performance
              </h2>

            </div>

            <div className="space-y-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <CheckCircle
                    size={20}
                    className="text-green-600"
                  />

                  <span>Completed</span>

                </div>

                <span className="font-bold">
                  {completedJobs}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <Clock
                    size={20}
                    className="text-yellow-600"
                  />

                  <span>Pending</span>

                </div>

                <span className="font-bold">
                  {pendingJobs}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <Briefcase
                    size={20}
                    className="text-blue-600"
                  />

                  <span>In Progress</span>

                </div>

                <span className="font-bold">
                  {inProgressJobs}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <AlertCircle
                    size={20}
                    className="text-red-600"
                  />

                  <span>Cancelled</span>

                </div>

                <span className="font-bold">
                  {cancelledJobs}
                </span>

              </div>

            </div>

            {/* COMPLETION RATE */}

            <div className="mt-8 border-t pt-6">

              <div className="mb-2 flex justify-between">

                <span className="font-medium">
                  Completion Rate
                </span>

                <span className="font-bold text-blue-600">
                  {completionRate}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{
                    width: `${completionRate}%`,
                  }}
                />

              </div>

            </div>

          </div>

          {/* PAYMENT PERFORMANCE */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

              <CreditCard
                className="text-green-600"
                size={24}
              />

              <h2 className="text-xl font-bold text-slate-800">
                Payment Performance
              </h2>

            </div>

            <div className="space-y-6">

              {/* PAID */}

              <div>

                <div className="mb-2 flex justify-between">

                  <span>Paid</span>

                  <span className="font-bold text-green-600">
                    GH₵ {paidAmount.toFixed(2)}
                  </span>

                </div>

                <div className="h-3 rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width:
                        totalRevenue > 0
                          ? `${Math.min(
                              (paidAmount /
                                totalRevenue) *
                                100,
                              100
                            )}%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

              {/* PARTIAL */}

              <div>

                <div className="mb-2 flex justify-between">

                  <span>Partial</span>

                  <span className="font-bold text-yellow-600">
                    GH₵ {partialAmount.toFixed(2)}
                  </span>

                </div>

                <div className="h-3 rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-yellow-500"
                    style={{
                      width:
                        totalRevenue > 0
                          ? `${Math.min(
                              (partialAmount /
                                totalRevenue) *
                                100,
                              100
                            )}%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

              {/* UNPAID */}

              <div>

                <div className="mb-2 flex justify-between">

                  <span>Unpaid</span>

                  <span className="font-bold text-red-600">
                    GH₵ {unpaidAmount.toFixed(2)}
                  </span>

                </div>

                <div className="h-3 rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-red-500"
                    style={{
                      width:
                        totalRevenue > 0
                          ? `${Math.min(
                              (unpaidAmount /
                                totalRevenue) *
                                100,
                              100
                            )}%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* REVENUE ANALYTICS */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2">
                <BarChart3 className="text-emerald-600" size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Monthly Revenue
                </h2>
                <p className="text-sm text-slate-500">
                  Revenue generated over the last six months.
                </p>
              </div>
            </div>

            <div className="flex h-64 items-end gap-3 border-b border-slate-200 px-2 pb-2">
              {monthlyRevenue.map((item) => {
                const height =
                  item.revenue === 0
                    ? 4
                    : Math.max(
                        8,
                        (item.revenue / maxMonthlyRevenue) * 100
                      );

                return (
                  <div
                    key={item.label}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-xs font-medium text-slate-500">
                      GH₵ {item.revenue.toFixed(0)}
                    </span>

                    <div
                      className="w-full max-w-12 rounded-t-lg bg-emerald-500 transition-all hover:bg-emerald-600"
                      style={{ height: `${height}%` }}
                      title={`GH₵ ${item.revenue.toFixed(2)}`}
                    />

                    <span className="text-center text-xs font-medium text-slate-500">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-2">
                <TrendingUp className="text-purple-600" size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Revenue by Service
                </h2>
                <p className="text-sm text-slate-500">
                  Services generating the most revenue.
                </p>
              </div>
            </div>

            {serviceRevenueList.length === 0 ? (
              <p className="py-8 text-center text-slate-500">
                No invoice data available yet.
              </p>
            ) : (
              <div className="space-y-5">
                {serviceRevenueList.map((item) => {
                  const percentage =
                    totalRevenue > 0
                      ? Math.round(
                          (item.revenue / totalRevenue) * 100
                        )
                      : 0;

                  return (
                    <div key={item.service}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">
                            {item.service}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.count}{" "}
                            {item.count === 1 ? "invoice" : "invoices"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="font-semibold text-emerald-600">
                            GH₵ {item.revenue.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {percentage}%
                          </p>
                        </div>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-purple-600 transition-all"
                          style={{
                            width: `${Math.max(
                              percentage,
                              item.revenue > 0 ? 2 : 0
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* SERVICE PERFORMANCE */}

        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">

            <FileText
              className="text-purple-600"
              size={24}
            />

            <h2 className="text-xl font-bold text-slate-800">
              Services Performance
            </h2>

          </div>

          {serviceList.length === 0 ? (

            <p className="py-8 text-center text-slate-500">
              No job data available yet.
            </p>

          ) : (

            <div className="space-y-5">

              {serviceList.map(
                ([service, count]) => {

                  const percentage =
                    totalJobs > 0
                      ? Math.round(
                          (count / totalJobs) * 100
                        )
                      : 0;

                  return (
                    <div key={service}>

                      <div className="mb-2 flex justify-between">

                        <span className="font-medium">
                          {service}
                        </span>

                        <span className="text-sm font-semibold text-slate-500">
                          {count} job
                          {count !== 1
                            ? "s"
                            : ""}{" "}
                          ({percentage}%)
                        </span>

                      </div>

                      <div className="h-3 rounded-full bg-slate-200">

                        <div
                          className="h-full rounded-full bg-purple-600"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

        {/* SUMMARY */}

        <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-lg">

          <div className="flex items-center gap-3">

            <TrendingUp size={28} />

            <h2 className="text-2xl font-bold">
              Business Summary
            </h2>

          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">

            <div>

              <p className="text-slate-400">
                Clients
              </p>

              <p className="mt-1 text-3xl font-bold">
                {totalClients}
              </p>

            </div>

            <div>

              <p className="text-slate-400">
                Jobs Completed
              </p>

              <p className="mt-1 text-3xl font-bold">
                {completedJobs}
              </p>

            </div>

            <div>

              <p className="text-slate-400">
                Revenue
              </p>

              <p className="mt-1 text-3xl font-bold">
                GH₵ {totalRevenue.toFixed(2)}
              </p>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}