"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Calculator,
  CheckCircle2,
  FileText,
  Loader2,
  UserPlus,
} from "lucide-react";

import { getClients, addClient } from "@/lib/clientService";
import { addJob } from "@/lib/jobService";
import { addInvoice } from "@/lib/invoiceService";
import { addPayment } from "@/lib/paymentService";

import { Client } from "@/lib/types";

type PaymentMethod =
  | "Cash"
  | "Mobile Money"
  | "Bank Transfer"
  | "Card";

const paymentMethods: PaymentMethod[] = [
  "Cash",
  "Mobile Money",
  "Bank Transfer",
  "Card",
];

export default function NewJobPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [clientType, setClientType] = useState<"new" | "existing">("new");
  const [selectedClientId, setSelectedClientId] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [service, setService] = useState("");
  const [serviceDetails, setServiceDetails] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  const [jobStatus, setJobStatus] =
    useState<Client["jobStatus"]>("Pending");

  const [paymentStatus, setPaymentStatus] =
    useState<Client["paymentStatus"]>("Unpaid");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Cash");

  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("Failed to load clients:", error);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  const subtotal = Number(amount) || 0;
  const discountAmount = Number(discount) || 0;

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const paid = Number(amountPaid) || 0;

  const balance = useMemo(() => {
    return Math.max(0, total - paid);
  }, [total, paid]);

  const handleExistingClientChange = (
    clientId: string
  ) => {
    setSelectedClientId(clientId);

    const client = clients.find(
      (item) => item.id === clientId
    );

    if (!client) return;

    setFullName(client.fullName);
    setPhone(client.phone);
    setEmail(client.email || "");
    setAddress(client.address || "");
  };

  const generateInvoiceNumber = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const random = Math.floor(1000 + Math.random() * 9000);

    return `INV-${year}${month}${day}-${random}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccess("");

    if (!fullName.trim()) {
      alert("Please enter the client's name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter the client's phone number.");
      return;
    }

    if (!service.trim()) {
      alert("Please enter the service.");
      return;
    }

    if (subtotal <= 0) {
      alert("Please enter a valid service amount.");
      return;
    }

    if (discountAmount > subtotal) {
      alert("Discount cannot be greater than the service amount.");
      return;
    }

    if (paid > total) {
      alert("Amount paid cannot be greater than the total.");
      return;
    }

    if (
      startDate &&
      endDate &&
      new Date(endDate) < new Date(startDate)
    ) {
      alert("End date cannot be before start date.");
      return;
    }

    if (paymentStatus === "Paid" && paid !== total) {
      alert("For a Paid job, Amount Paid must equal the Total.");
      return;
    }

    if (paymentStatus === "Unpaid" && paid !== 0) {
      alert("For an Unpaid job, Amount Paid should be 0.");
      return;
    }

    if (
      paymentStatus === "Part Payment" &&
      (paid <= 0 || paid >= total)
    ) {
      alert(
        "For Part Payment, Amount Paid must be greater than 0 and less than the Total."
      );
      return;
    }

    setSaving(true);

    try {
      let clientId = selectedClientId;

      // --------------------------------------------------
      // 1. CREATE CLIENT IF NEW
      // --------------------------------------------------

      if (clientType === "new") {
        clientId = await addClient({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          service: service.trim(),
          serviceDetails: serviceDetails.trim(),
          amount: subtotal,
          discount: discountAmount,
          total,
          jobStatus,
          paymentStatus,
          amountPaid: paid,
          balance,
        });
      }

      if (!clientId) {
        throw new Error("Client could not be identified.");
      }

      // --------------------------------------------------
      // 2. CREATE JOB
      // --------------------------------------------------

      const jobId = await addJob({
        clientId,
        clientName: fullName.trim(),
        phone: phone.trim(),
        service: service.trim(),
        serviceDetails: serviceDetails.trim(),
        amount: subtotal,
        discount: discountAmount,
        total,
        amountPaid: paid,
        balance,
        jobStatus,
        paymentStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // --------------------------------------------------
      // 3. CREATE INVOICE
      // --------------------------------------------------

      const invoiceNumber = generateInvoiceNumber();

      await addInvoice({
        invoiceNumber,
        jobId,
        clientName: fullName.trim(),
        phone: phone.trim(),
        service: service.trim(),
        amount: subtotal,
        discount: discountAmount,
        total,
        amountPaid: paid,
        balance,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        paymentStatus:
          paymentStatus === "Part Payment"
            ? "Part Payment"
            : paymentStatus,
      });

      // --------------------------------------------------
      // 4. CREATE PAYMENT RECORD
      // --------------------------------------------------

      await addPayment({
        jobId,
        clientId,
        clientName: fullName.trim(),
        phone: phone.trim(),
        service: service.trim(),
        jobAmount: total,
        amountPaid: paid,
        balance,
        paymentStatus,
        paymentMethod,
        paymentDate: new Date(),
        notes: notes.trim(),
      });

      setSuccess(
        `Job saved successfully. Invoice ${invoiceNumber} created.`
      );

      setTimeout(() => {
        router.push("/jobs");
      }, 1500);
    } catch (error) {
      console.error("SAVE JOB ERROR:", error);

      alert(
        "Something went wrong while saving the job. Please check the console for details."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="rounded-xl bg-white p-3 shadow-sm border border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              New Job
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a client, job, invoice and payment in one place.
            </p>
          </div>

        </div>

      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* CLIENT */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <UserPlus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Client Information
              </h2>

              <p className="text-sm text-slate-500">
                Select an existing client or create a new one.
              </p>
            </div>
          </div>

          {/* Client Type */}
          <div className="mb-6 flex gap-3">

            <button
              type="button"
              onClick={() => setClientType("new")}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                clientType === "new"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              New Client
            </button>

            <button
              type="button"
              onClick={() => setClientType("existing")}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                clientType === "existing"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Existing Client
            </button>

          </div>

          {/* Existing Client */}
          {clientType === "existing" && (
            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Select Client
              </label>

              <select
                value={selectedClientId}
                onChange={(e) =>
                  handleExistingClientChange(e.target.value)
                }
                disabled={loadingClients}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">
                  {loadingClients
                    ? "Loading clients..."
                    : "Select a client"}
                </option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.fullName} — {client.phone}
                  </option>
                ))}
              </select>

            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Full Name *
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Client full name"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone *
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024 XXX XXXX"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Client address"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

          </div>
        </section>

        {/* JOB */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <Briefcase size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Job Information
              </h2>

              <p className="text-sm text-slate-500">
                Enter the work details and duration.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Service */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Service *
              </label>

              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="e.g. Project Work"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Job Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Status
              </label>

              <select
                value={jobStatus}
                onChange={(e) =>
                  setJobStatus(
                    e.target.value as Client["jobStatus"]
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Details */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Details
              </label>

              <textarea
                value={serviceDetails}
                onChange={(e) =>
                  setServiceDetails(e.target.value)
                }
                placeholder="Describe the work to be done..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

          </div>
        </section>

        {/* FINANCIAL */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3 text-green-600">
              <Calculator size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Payment & Invoice
              </h2>

              <p className="text-sm text-slate-500">
                Set the amount, discount and payment information.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Service Amount (GH₵) *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Discount (GH₵)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Amount Paid */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Amount Paid (GH₵)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Status
              </label>

              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(
                    e.target.value as Client["paymentStatus"]
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Part Payment">
                  Part Payment
                </option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(
                    e.target.value as PaymentMethod
                  )
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Notes
              </label>

              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional payment notes"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

          </div>

          {/* Calculation */}
          <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-4">

            <div>
              <p className="text-sm text-slate-500">
                Subtotal
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                GH₵ {subtotal.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Discount
              </p>

              <p className="mt-1 text-xl font-bold text-red-600">
                - GH₵ {discountAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Total
              </p>

              <p className="mt-1 text-xl font-bold text-blue-600">
                GH₵ {total.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Balance
              </p>

              <p className="mt-1 text-xl font-bold text-orange-600">
                GH₵ {balance.toFixed(2)}
              </p>
            </div>

          </div>
        </section>

        {/* SAVE */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() => router.push("/jobs")}
            disabled={saving}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Saving...
              </>
            ) : (
              <>
                <FileText size={20} />
                Save Job & Create Invoice
              </>
            )}
          </button>

        </div>

      </form>
    </main>
  );
}