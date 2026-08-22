"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  X,
  Printer,
} from "lucide-react";

import {
  getInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
} from "../../lib/invoiceService";

import { Invoice } from "../../lib/invoiceTypes";
import {
  CompanySettings,
  defaultSettings,
  getCompanySettings,
} from "../../lib/settingsService";


const getSocialDisplay = (value: string) => {
  if (!value) return "";

  const trimmed = value.trim();

  // Already a handle
  if (trimmed.startsWith("@")) {
    return trimmed;
  }

  // Extract the last path segment from a social URL
  try {
    const url = new URL(
      trimmed.startsWith("http")
        ? trimmed
        : `https://${trimmed}`
    );

    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    if (parts.length > 0) {
      const handle = parts[parts.length - 1]
        .split("?")[0]
        .split("#")[0];

      if (handle) {
        return `@${handle.replace(/^@/, "")}`;
      }
    }
  } catch {
    // Fall back to the saved value below.
  }

  return trimmed;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [viewingInvoice, setViewingInvoice] =
    useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] =
    useState<Invoice | null>(null);

  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<Invoice["paymentStatus"]>("Unpaid");

  const [loading, setLoading] = useState(true);

  const [company, setCompany] =
    useState<CompanySettings>(defaultSettings);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error("Error loading invoices:", error);
      alert("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);

        const [invoiceData, companyData] =
          await Promise.all([
            getInvoices(),
            getCompanySettings(),
          ]);

        setInvoices(invoiceData);
        setCompany(companyData);
      } catch (error) {
        console.error("Error loading invoice page:", error);
        alert("Failed to load invoice data.");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const resetForm = () => {
    setClientName("");
    setPhone("");
    setService("");
    setAmount("");
    setPaymentStatus("Unpaid");
    setEditingInvoice(null);
  };

  const handleSaveInvoice = async () => {
    if (!clientName || !phone || !service || !amount) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, {
          clientName,
          phone,
          service,
          amount: Number(amount),
          paymentStatus,
        });
      } else {
        const invoiceNumber = `INV-${Date.now()
          .toString()
          .slice(-6)}`;

        await addInvoice({
          invoiceNumber,
          clientName,
          phone,
          service,
          amount: Number(amount),
          paymentStatus,
        });
      }

      await loadInvoices();

      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice.");
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setClientName(invoice.clientName);
    setPhone(invoice.phone);
    setService(invoice.service);
    setAmount(String(invoice.amount));
    setPaymentStatus(invoice.paymentStatus);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmed) return;

    try {
      await deleteInvoice(id);
      await loadInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice.");
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      invoice.clientName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      invoice.phone.includes(search) ||
      invoice.service
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalInvoices = invoices.length;

  const paidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "Paid"
  ).length;

  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "Unpaid"
  ).length;

  const totalAmount = invoices.reduce(
    (total, invoice) =>
      total + Number(invoice.amount || 0),
    0
  );

  const paymentColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Partial":
        return "bg-yellow-100 text-yellow-700";

      case "Unpaid":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (createdAt: any) => {
    if (!createdAt) return "—";

    if (createdAt?.seconds) {
      return new Date(
        createdAt.seconds * 1000
      ).toLocaleDateString("en-GB");
    }

    if (createdAt instanceof Date) {
      return createdAt.toLocaleDateString("en-GB");
    }

    return String(createdAt);
  };

  return (
    <>
      {/* PRINT STYLES */}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-invoice,
          .print-invoice * {
            visibility: visible !important;
          }

          .print-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>

      <div className="space-y-8">

        {/* HEADER */}

        <div className="flex items-center justify-between no-print">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Invoice Management
            </h1>

            <p className="mt-1 text-slate-500">
              Create and manage Costa Kudus Tech invoices.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Invoice
          </button>

        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 no-print">

          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
            <FileText size={34} className="mb-3" />
            <p>Total Invoices</p>
            <h2 className="mt-2 text-4xl font-bold">
              {totalInvoices}
            </h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg">
            <FileText size={34} className="mb-3" />
            <p>Paid</p>
            <h2 className="mt-2 text-4xl font-bold">
              {paidInvoices}
            </h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
            <FileText size={34} className="mb-3" />
            <p>Unpaid</p>
            <h2 className="mt-2 text-4xl font-bold">
              {unpaidInvoices}
            </h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-lg">
            <FileText size={34} className="mb-3" />
            <p>Total Amount</p>
            <h2 className="mt-2 text-3xl font-bold">
              GH₵ {totalAmount.toFixed(2)}
            </h2>
          </div>

        </div>

        {/* SEARCH */}

        <div className="rounded-2xl border bg-white p-5 shadow-sm no-print">

          <div className="relative">

            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search by invoice, client, phone or service..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm no-print">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr className="text-left">

                <th className="p-4">
                  Invoice
                </th>

                <th>
                  Client
                </th>

                <th>
                  Service
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Payment
                </th>

                <th className="text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-slate-500"
                  >
                    Loading invoices...
                  </td>
                </tr>

              ) : filteredInvoices.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-slate-500"
                  >
                    No invoices found.
                  </td>
                </tr>

              ) : (

                filteredInvoices.map((invoice) => (

                  <tr
                    key={invoice.id}
                    className="border-t hover:bg-slate-50"
                  >

                    <td className="p-4">

                      <div className="font-semibold text-blue-600">
                        {invoice.invoiceNumber}
                      </div>

                      <div className="text-xs text-slate-400">
                        {formatDate(invoice.createdAt)}
                      </div>

                    </td>

                    <td>

                      <div className="font-semibold">
                        {invoice.clientName}
                      </div>

                      <div className="text-sm text-slate-500">
                        {invoice.phone}
                      </div>

                    </td>

                    <td>
                      {invoice.service}
                    </td>

                    <td className="font-semibold">
                      GH₵{" "}
                      {Number(
                        invoice.amount
                      ).toFixed(2)}
                    </td>

                    <td>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${paymentColor(
                          invoice.paymentStatus
                        )}`}
                      >
                        {invoice.paymentStatus}
                      </span>

                    </td>

                    <td>

                      <div className="flex justify-center gap-3">

                        <button
                          onClick={() =>
                            setViewingInvoice(invoice)
                          }
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleEdit(invoice)
                          }
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(invoice.id)
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

        {/* CREATE / EDIT MODAL */}

        {showForm && (

          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 no-print">

            <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b p-6">

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {editingInvoice
                      ? "Edit Invoice"
                      : "Create Invoice"}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Costa Kudus Tech
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-lg p-2 hover:bg-slate-100"
                >
                  <X size={22} />
                </button>

              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Client Name
                  </label>

                  <input
                    value={clientName}
                    onChange={(e) =>
                      setClientName(e.target.value)
                    }
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone
                  </label>

                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Service
                  </label>

                  <input
                    value={service}
                    onChange={(e) =>
                      setService(e.target.value)
                    }
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Service"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Amount (GH₵)
                  </label>

                  <input
                    type="number"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium">
                    Payment Status
                  </label>

                  <select
                    value={paymentStatus}
                    onChange={(e) =>
                      setPaymentStatus(
                        e.target.value as Invoice["paymentStatus"]
                      )
                    }
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Unpaid">
                      Unpaid
                    </option>

                    <option value="Partial">
                      Partial
                    </option>

                    <option value="Paid">
                      Paid
                    </option>
                  </select>

                </div>

              </div>

              <div className="flex justify-end gap-3 border-t p-6">

                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="rounded-xl border px-5 py-3"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveInvoice}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {editingInvoice
                    ? "Update Invoice"
                    : "Save Invoice"}
                </button>

              </div>

            </div>

          </div>

        )}

        {/* BRANDED VIEW / PRINT INVOICE */}

        {viewingInvoice && (

          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

            <div className="my-8 w-full max-w-3xl">

              <div className="print-invoice rounded-2xl bg-white shadow-2xl">

                {/* COMPANY HEADER */}

                <div className="border-b-4 border-slate-800 p-8">

                  <div className="flex items-start justify-between gap-6">

                    <div className="flex items-center gap-4">

                      <Image
                        src={company.logo}
                        alt={company.companyName}
                        width={85}
                        height={85}
                        className="rounded-xl object-contain"
                      />

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
                        INVOICE
                      </h2>

                      <p className="mt-2 font-semibold text-blue-600">
                        {viewingInvoice.invoiceNumber}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Date:{" "}
                        {formatDate(
                          viewingInvoice.createdAt
                        )}
                      </p>

                    </div>

                  </div>

                  {/* CONTACT DETAILS */}

                  <div className="mt-6 grid gap-2 border-t pt-4 text-sm text-slate-600 md:grid-cols-2">

                    <div>
                      <strong>Phone:</strong>{" "}
                      {company.phone}
                    </div>

                    <div>
                      <strong>WhatsApp:</strong>{" "}
                      {company.whatsapp}
                    </div>

                    <div>
                      <strong>Email:</strong>{" "}
                      {company.email}
                    </div>

                    <div>
                      <strong>Website:</strong>{" "}
                      {company.website}
                    </div>

                    <div>
                      <strong>TikTok:</strong>{" "}
                      {getSocialDisplay(company.socialMedia)}
                    </div>

                  </div>

                </div>

                {/* CUSTOMER */}

                <div className="grid gap-6 p-8 md:grid-cols-2">

                  <div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bill To
                    </p>

                    <p className="text-lg font-bold text-slate-800">
                      {viewingInvoice.clientName}
                    </p>

                    <p className="text-slate-600">
                      {viewingInvoice.phone}
                    </p>

                  </div>

                  <div className="md:text-right">

                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payment Status
                    </p>

                    <span
                      className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${paymentColor(
                        viewingInvoice.paymentStatus
                      )}`}
                    >
                      {viewingInvoice.paymentStatus}
                    </span>

                  </div>

                </div>

                {/* SERVICE TABLE */}

                <div className="px-8">

                  <table className="w-full border-collapse">

                    <thead>

                      <tr className="bg-slate-800 text-left text-white">

                        <th className="rounded-l-lg p-4">
                          Description
                        </th>

                        <th className="rounded-r-lg p-4 text-right">
                          Amount
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      <tr className="border-b">

                        <td className="p-5">

                          <p className="font-semibold text-slate-800">
                            {viewingInvoice.service}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Professional service provided by {company.companyName}.
                          </p>

                        </td>

                        <td className="p-5 text-right font-semibold">

                          GH₵{" "}
                          {Number(
                            viewingInvoice.amount
                          ).toFixed(2)}

                        </td>

                      </tr>

                    </tbody>

                  </table>

                </div>

                {/* TOTAL */}

                <div className="flex justify-end px-8 py-6">

                  <div className="w-full md:w-80">

                    <div className="flex justify-between border-t-2 border-slate-800 pt-4">

                      <span className="text-xl font-bold">
                        Total
                      </span>

                      <span className="text-2xl font-bold text-blue-600">
                        GH₵{" "}
                        {Number(
                          viewingInvoice.amount
                        ).toFixed(2)}
                      </span>

                    </div>

                  </div>

                </div>

                {/* SIGNATURES */}

                <div className="grid gap-12 px-8 pb-10 pt-4 md:grid-cols-2">
                  <div>
                    <div className="h-12 border-b border-slate-800" />
                    <p className="mt-2 font-semibold text-slate-800">
                      Customer Signature
                    </p>
                    <p className="text-sm text-slate-500">
                      Name: {viewingInvoice.clientName}
                    </p>
                    <p className="text-sm text-slate-500">
                      Date: {formatDate(viewingInvoice.createdAt)}
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
                      Date: {formatDate(viewingInvoice.createdAt)}
                    </p>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="border-t bg-slate-50 px-8 py-6 text-center">

                  <p className="font-semibold text-slate-800">
                    Thank you for doing business with {company.companyName}.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {company.website} • TikTok: {getSocialDisplay(company.socialMedia)}
                  </p>

                </div>

                {/* ACTIONS */}

                <div className="no-print flex justify-end gap-3 border-t p-6">

                  <button
                    onClick={() =>
                      window.print()
                    }
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                  >
                    <Printer size={18} />
                    Print / Save PDF
                  </button>

                  <button
                    onClick={() =>
                      setViewingInvoice(null)
                    }
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
    </>
  );
}