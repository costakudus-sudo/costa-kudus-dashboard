"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Banknote,
  CalendarDays,
  Printer,
  ReceiptText,
} from "lucide-react";

import {
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
} from "../../lib/paymentService";

import { Payment } from "../../lib/paymentTypes";

import { getJobs } from "../../lib/jobService";

import { getClients } from "../../lib/clientService";

import {
  CompanySettings,
  defaultSettings,
  getCompanySettings,
} from "../../lib/settingsService";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<any>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  const [jobId, setJobId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [company, setCompany] =
    useState<CompanySettings>(defaultSettings);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentData, jobData, clientData, companyData] =
        await Promise.all([
          getPayments(),
          getJobs(),
          getClients(),
          getCompanySettings(),
        ]);

      setPayments(paymentData);
      setJobs(jobData);
      setClients(clientData);
      setCompany(companyData);
    } catch (error) {
      console.error("Error loading payment data:", error);
    }
  };

  const resetForm = () => {
    setJobId("");
    setAmountPaid("");
    setPaymentMethod("Cash");
    setNotes("");
    setEditingPayment(null);
  };

  const openAddForm = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEditForm = (payment: any) => {
    setEditingPayment(payment);
    setJobId(payment.jobId);
    setAmountPaid(String(payment.amountPaid));
    setPaymentMethod(payment.paymentMethod || "Cash");
    setNotes(payment.notes || "");
    setOpenForm(true);
  };

  const handleSavePayment = async () => {
    if (!jobId || !amountPaid) {
      alert("Please select a job and enter the amount paid.");
      return;
    }

    const job = jobs.find((item) => item.id === jobId);

    if (!job) {
      alert("Selected job could not be found.");
      return;
    }

    const jobAmount = Number(job.amount || 0);
    const paid = Number(amountPaid);

    if (paid <= 0) {
      alert("Amount paid must be greater than zero.");
      return;
    }

    if (paid > jobAmount) {
      alert("Amount paid cannot be greater than the job amount.");
      return;
    }

    const balance = jobAmount - paid;

    let status:
      | "Unpaid"
      | "Part Payment"
      | "Paid" = "Unpaid";

    if (paid === jobAmount) {
      status = "Paid";
    } else if (paid > 0) {
      status = "Part Payment";
    }

    const paymentData = {
      jobId: job.id,
      clientId: job.clientId || "",
      clientName: job.clientName || "",
      phone: job.phone || "",
      service: job.service || "",
      jobAmount,
      amountPaid: paid,
      balance,
      paymentStatus: status,
      paymentMethod: paymentMethod as Payment["paymentMethod"],
      paymentDate: new Date(),
      notes,
    };

    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, paymentData);
      } else {
        await addPayment(paymentData);
      }

      await loadData();

      setOpenForm(false);
      resetForm();
    } catch (error) {
      console.error("Error saving payment:", error);
      alert("Failed to save payment.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) return;

    try {
      await deletePayment(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment.");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Part Payment":
        return "bg-yellow-100 text-yellow-700";

      case "Unpaid":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      (payment.clientName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (payment.phone || "").includes(search) ||
      (payment.service || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (payment.paymentStatus || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalPayments = payments.reduce(
    (sum, payment) => sum + Number(payment.amountPaid || 0),
    0
  );

  const totalOutstanding = payments.reduce(
    (sum, payment) => sum + Number(payment.balance || 0),
    0
  );

  const paidCount = payments.filter(
    (payment) => payment.paymentStatus === "Paid"
  ).length;

  const pendingCount = payments.filter(
    (payment) => payment.paymentStatus !== "Paid"
  ).length;

  const formatPaymentDate = (value: any) => {
    if (!value) return "—";

    try {
      let date: Date;

      if (typeof value?.toDate === "function") {
        date = value.toDate();
      } else if (value?.seconds) {
        date = new Date(value.seconds * 1000);
      } else {
        date = new Date(value);
      }

      if (Number.isNaN(date.getTime())) {
        return "—";
      }

      return date.toLocaleDateString("en-GH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const receiptNumber = (payment: any) =>
    `RCT-${String(payment.id || "").slice(-6).toUpperCase()}`;

  const getSocialDisplay = (value: string) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (trimmed.startsWith("@")) return trimmed;
    try {
      const url = new URL(
        trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
      );
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length) {
        return `@${parts[parts.length - 1]
          .split("?")[0]
          .split("#")[0]
          .replace(/^@/, "")}`;
      }
    } catch {}
    return trimmed;
  };

  const totalJobValue = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.jobAmount || 0),
    0
  );

  const averagePayment =
    payments.length > 0
      ? totalPayments / payments.length
      : 0;

  const paymentMethodSummary = payments.reduce(
    (summary: Record<string, number>, payment) => {
      const method =
        payment.paymentMethod || "Other";

      summary[method] =
        (summary[method] || 0) +
        Number(payment.amountPaid || 0);

      return summary;
    },
    {}
  );

  const topPaymentMethods = Object.entries(
    paymentMethodSummary
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Payment Management
          </h1>

          <p className="mt-1 text-slate-500">
            Track and manage Costa Kudus Tech payments.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Payment
        </button>

      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <CreditCard size={34} className="mb-3" />
          <p>Total Payments</p>
          <h2 className="mt-2 text-4xl font-bold">
            GH₵ {totalPayments.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg">
          <CheckCircle size={34} className="mb-3" />
          <p>Paid Payments</p>
          <h2 className="mt-2 text-4xl font-bold">
            {paidCount}
          </h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <Clock size={34} className="mb-3" />
          <p>Pending Payments</p>
          <h2 className="mt-2 text-4xl font-bold">
            {pendingCount}
          </h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-lg">
          <AlertCircle size={34} className="mb-3" />
          <p>Outstanding</p>
          <h2 className="mt-2 text-4xl font-bold">
            GH₵ {totalOutstanding.toFixed(2)}
          </h2>
        </div>

      </div>

      {/* PAYMENT INSIGHTS */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2">
              <Banknote
                size={22}
                className="text-emerald-600"
              />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total Job Value
              </p>
              <p className="text-2xl font-bold text-slate-800">
                GH₵ {totalJobValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2">
              <CreditCard
                size={22}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Average Payment
              </p>
              <p className="text-2xl font-bold text-slate-800">
                GH₵ {averagePayment.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2">
              <CalendarDays
                size={22}
                className="text-purple-600"
              />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Payment Records
              </p>
              <p className="text-2xl font-bold text-slate-800">
                {payments.length}
              </p>
            </div>
          </div>
        </div>

      </div>

      {topPaymentMethods.length > 0 && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Payment Methods
            </h2>
            <p className="text-sm text-slate-500">
              Amount collected by payment method.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {topPaymentMethods.map(
              ([method, amount]) => (
                <div
                  key={method}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-500">
                    {method}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-800">
                    GH₵ {Number(amount).toFixed(2)}
                  </p>
                </div>
              )
            )}

          </div>

        </div>
      )}

      {/* SEARCH */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="relative">

          <Search
            className="absolute left-4 top-3.5 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search by client, phone, service or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr className="text-left">

              <th className="p-4">Client</th>
              <th>Service</th>
              <th>Job Amount</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
              <th className="text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredPayments.length === 0 ? (

              <tr>
                <td
                  colSpan={9}
                  className="p-10 text-center text-slate-500"
                >
                  No payments found.
                </td>
              </tr>

            ) : (

              filteredPayments.map((payment) => (

                <tr
                  key={payment.id}
                  className="border-t hover:bg-slate-50"
                >

                  <td className="p-4 font-semibold">
                    {payment.clientName}
                  </td>

                  <td>
                    {payment.service}
                  </td>

                  <td>
                    GH₵ {Number(payment.jobAmount || 0).toFixed(2)}
                  </td>

                  <td className="font-semibold text-green-600">
                    GH₵ {Number(payment.amountPaid || 0).toFixed(2)}
                  </td>

                  <td className="font-semibold text-red-600">
                    GH₵ {Number(payment.balance || 0).toFixed(2)}
                  </td>

                  <td>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor(
                        payment.paymentStatus
                      )}`}
                    >
                      {payment.paymentStatus}
                    </span>

                  </td>

                  <td>

                    <div className="flex justify-center gap-3">

                      <button
                        onClick={() =>
                          setViewingPayment(payment)
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="View / Receipt"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          openEditForm(payment)
                        }
                        className="text-green-600 hover:text-green-800"
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(payment.id)
                        }
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ADD / EDIT PAYMENT MODAL */}

      {openForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-6">

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingPayment ? "Edit Payment" : "Add Payment"}
                </h2>

                <p className="text-sm text-slate-500">
                  Costa Kudus Tech
                </p>
              </div>

              <button
                onClick={() => {
                  setOpenForm(false);
                  resetForm();
                }}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X />
              </button>

            </div>

            <div className="space-y-5 p-6">

              {/* JOB */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Job
                </label>

                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select a job
                  </option>

                  {jobs.map((job) => (

                    <option
                      key={job.id}
                      value={job.id}
                    >
                      {job.clientName} — {job.service} — GH₵{" "}
                      {Number(job.amount || 0).toFixed(2)}
                    </option>

                  ))}

                </select>

              </div>

              {/* AMOUNT */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount Paid
                </label>

                <input
                  type="number"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Enter amount paid"
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* PAYMENT METHOD */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option>Cash</option>
                  <option>Mobile Money</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>

                </select>

              </div>

              {/* NOTES */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional payment notes..."
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t p-6">

              <button
                onClick={() => {
                  setOpenForm(false);
                  resetForm();
                }}
                className="rounded-xl border px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={handleSavePayment}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {editingPayment ? "Update Payment" : "Save Payment"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* VIEW PAYMENT / PRINT RECEIPT MODAL */}

      {viewingPayment && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="my-8 w-full max-w-3xl">

            <style jsx global>{`
              @media print {
                body * { visibility: hidden !important; }
                .print-receipt,
                .print-receipt * { visibility: visible !important; }
                .print-receipt {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  background: white !important;
                  box-shadow: none !important;
                }
                .no-print { display: none !important; }
                @page { size: A4; margin: 12mm; }
              }
            `}</style>

            <div className="print-receipt overflow-hidden rounded-2xl bg-white shadow-2xl">

              <div className="border-b-4 border-slate-800 p-8">
                <div className="flex items-start justify-between gap-6">

                  <div className="flex items-center gap-4">
                    {company.logo ? (
                      <Image
                        src={company.logo}
                        alt={company.companyName}
                        width={85}
                        height={85}
                        className="rounded-xl object-contain"
                      />
                    ) : (
                      <div className="flex h-[85px] w-[85px] items-center justify-center rounded-xl bg-slate-100">
                        <ReceiptText size={36} className="text-slate-500" />
                      </div>
                    )}

                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">
                        {company.companyName}
                      </h1>
                      <p className="font-medium text-blue-600">
                        {company.tagline}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {company.address}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <h2 className="text-3xl font-bold tracking-wider text-slate-800">
                      RECEIPT
                    </h2>
                    <p className="mt-2 font-semibold text-blue-600">
                      {receiptNumber(viewingPayment)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Date: {formatPaymentDate(viewingPayment.paymentDate)}
                    </p>
                  </div>

                </div>

                <div className="mt-6 grid gap-2 border-t pt-4 text-sm text-slate-600 md:grid-cols-2">
                  <div><strong>Phone:</strong> {company.phone}</div>
                  <div><strong>WhatsApp:</strong> {company.whatsapp}</div>
                  <div><strong>Email:</strong> {company.email}</div>
                  <div><strong>Website:</strong> {company.website}</div>
                  <div><strong>Social:</strong> {getSocialDisplay(company.socialMedia)}</div>
                </div>
              </div>

              <div className="grid gap-6 p-8 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Received From
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {viewingPayment.clientName}
                  </p>
                  <p className="text-slate-600">{viewingPayment.phone}</p>
                </div>

                <div className="md:text-right">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Payment Method
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {viewingPayment.paymentMethod === "Mobile Money"
                      ? "Mobile Money (MoMo)"
                      : viewingPayment.paymentMethod}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Status: {viewingPayment.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="px-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-left text-white">
                      <th className="rounded-l-lg p-4">Description</th>
                      <th className="p-4 text-right">Job Amount</th>
                      <th className="rounded-r-lg p-4 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-5">
                        <p className="font-semibold text-slate-800">
                          {viewingPayment.service}
                        </p>
                        {viewingPayment.notes && (
                          <p className="mt-1 text-sm text-slate-500">
                            {viewingPayment.notes}
                          </p>
                        )}
                      </td>
                      <td className="p-5 text-right font-semibold">
                        GH₵ {Number(viewingPayment.jobAmount || 0).toFixed(2)}
                      </td>
                      <td className="p-5 text-right font-semibold text-emerald-600">
                        GH₵ {Number(viewingPayment.amountPaid || 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end px-8 py-6">
                <div className="w-full md:w-80">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Job Amount</span>
                    <span className="font-semibold">
                      GH₵ {Number(viewingPayment.jobAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Amount Paid</span>
                    <span className="font-semibold text-emerald-600">
                      GH₵ {Number(viewingPayment.amountPaid || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t-2 border-slate-800 pt-4">
                    <span className="text-xl font-bold">Balance</span>
                    <span className="text-2xl font-bold text-red-600">
                      GH₵ {Number(viewingPayment.balance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-12 px-8 pb-10 pt-4 md:grid-cols-2">
                <div>
                  <div className="h-12 border-b border-slate-800" />
                  <p className="mt-2 font-semibold text-slate-800">
                    Customer Signature
                  </p>
                  <p className="text-sm text-slate-500">
                    Name: {viewingPayment.clientName}
                  </p>
                  <p className="text-sm text-slate-500">
                    Date: {formatPaymentDate(viewingPayment.paymentDate)}
                  </p>
                </div>

                <div>
                  <div className="h-12 border-b border-slate-800" />
                  <p className="mt-2 font-semibold text-slate-800">
                    Attendant Signature
                  </p>
                  <p className="text-sm text-slate-500">
                    For: {company.companyName}
                  </p>
                  <p className="text-sm text-slate-500">
                    Date: {formatPaymentDate(viewingPayment.paymentDate)}
                  </p>
                </div>
              </div>

              <div className="border-t bg-slate-50 px-8 py-6 text-center">
                <p className="font-semibold text-slate-800">
                  Thank you for your payment.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Thank you for doing business with {company.companyName}.
                </p>
              </div>

              <div className="no-print flex justify-end gap-3 border-t p-6">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                >
                  <Printer size={18} />
                  Print / Save Receipt
                </button>

                <button
                  onClick={() => setViewingPayment(null)}
                  className="rounded-xl bg-slate-800 px-5 py-3 font-medium text-white hover:bg-slate-900"
                >
                  Close
                </button>
              </div>

            </div>
          </div>

        </div>

      )}


    </div>
  );
}