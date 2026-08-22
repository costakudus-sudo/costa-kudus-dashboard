"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ReceiptText,
  X,
  Printer,
} from "lucide-react";

import {
  getPayments,
  addPayment,
  updatePayment,
  deletePayment,
} from "../../lib/paymentService";
import { Payment } from "../../lib/paymentTypes";
import {
  CompanySettings,
  defaultSettings,
  getCompanySettings,
} from "../../lib/settingsService";

export default function ReceiptsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [jobAmount, setJobAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<Payment["paymentMethod"]>("Cash");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanySettings>(defaultSettings);

  const today = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentData, companyData] = await Promise.all([
        getPayments(),
        getCompanySettings(),
      ]);
      setPayments(paymentData);
      setCompany(companyData);
    } catch (error) {
      console.error(error);
      alert("Failed to load receipts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setClientName("");
    setPhone("");
    setService("");
    setJobAmount("");
    setAmountPaid("");
    setPaymentMethod("Cash");
    setPaymentDate(today());
    setNotes("");
    setEditingPayment(null);
  };

  const formatDate = (value: any) => {
    if (!value) return "—";
    try {
      const date =
        typeof value?.toDate === "function"
          ? value.toDate()
          : value?.seconds
            ? new Date(value.seconds * 1000)
            : new Date(value);
      return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-GB");
    } catch {
      return "—";
    }
  };

  const handleSaveReceipt = async () => {
    if (!clientName || !phone || !service || !jobAmount || !amountPaid) {
      alert("Please complete all required fields.");
      return;
    }

    const total = Number(jobAmount);
    const paid = Number(amountPaid);

    if (total <= 0 || paid <= 0 || paid > total) {
      alert("Please enter valid payment amounts.");
      return;
    }

    const balance = total - paid;
    const status: Payment["paymentStatus"] =
      paid >= total ? "Paid" : "Part Payment";

    try {
      const data = {
        jobId: editingPayment?.jobId || "",
        clientId: editingPayment?.clientId || "",
        clientName,
        phone,
        service,
        jobAmount: total,
        amountPaid: paid,
        balance,
        paymentStatus: status,
        paymentMethod,
        paymentDate: paymentDate
          ? new Date(`${paymentDate}T12:00:00`)
          : new Date(),
        notes,
      };

      if (editingPayment) {
        await updatePayment(editingPayment.id, data);
      } else {
        await addPayment(data);
      }

      await loadData();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Failed to save receipt.");
    }
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setClientName(payment.clientName);
    setPhone(payment.phone);
    setService(payment.service);
    setJobAmount(String(payment.jobAmount));
    setAmountPaid(String(payment.amountPaid));
    setPaymentMethod(payment.paymentMethod);
    setNotes(payment.notes || "");

    const raw: any = payment.paymentDate;
    const date =
      typeof raw?.toDate === "function"
        ? raw.toDate()
        : raw?.seconds
          ? new Date(raw.seconds * 1000)
          : new Date(raw);

    setPaymentDate(
      Number.isNaN(date.getTime())
        ? today()
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    );
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) return;
    try {
      await deletePayment(id);
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete receipt.");
    }
  };

  const filtered = payments.filter(
    (p) =>
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.service.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments.reduce(
    (sum, p) => sum + Number(p.amountPaid || 0),
    0
  );

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-receipt, .print-receipt * { visibility: visible !important; }
          .print-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 12mm; }
        }
      `}</style>

      <div className="space-y-8">
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Receipt Management
            </h1>
            <p className="mt-1 text-slate-500">
              Create and manage Costa Kudus Tech receipts.
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
            Create Receipt
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 no-print">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
            <ReceiptText size={34} className="mb-3" />
            <p>Total Receipts</p>
            <h2 className="mt-2 text-4xl font-bold">{payments.length}</h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg">
            <ReceiptText size={34} className="mb-3" />
            <p>Paid Receipts</p>
            <h2 className="mt-2 text-4xl font-bold">
              {payments.filter((p) => p.paymentStatus === "Paid").length}
            </h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-lg">
            <ReceiptText size={34} className="mb-3" />
            <p>Total Collected</p>
            <h2 className="mt-2 text-3xl font-bold">
              GH₵ {totalCollected.toFixed(2)}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm no-print">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by client, phone or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm no-print">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr className="text-left">
                  <th className="p-4">Receipt</th>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Paid</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500">
                      Loading receipts...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500">
                      No receipts found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((payment) => (
                    <tr key={payment.id} className="border-t hover:bg-slate-50">
                      <td className="p-4 font-semibold text-blue-600">
                        RCT-{payment.id.slice(-6).toUpperCase()}
                      </td>
                      <td>
                        <div className="font-semibold">{payment.clientName}</div>
                        <div className="text-sm text-slate-500">{payment.phone}</div>
                      </td>
                      <td>{payment.service}</td>
                      <td className="font-semibold text-emerald-600">
                        GH₵ {Number(payment.amountPaid).toFixed(2)}
                      </td>
                      <td>{payment.paymentMethod}</td>
                      <td>{formatDate(payment.paymentDate)}</td>
                      <td>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setViewingReceipt(payment)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(payment)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(payment.id)}
                            className="text-red-600 hover:text-red-800"
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
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 no-print">
            <div className="my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b p-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {editingPayment ? "Edit Receipt" : "Create Receipt"}
                  </h2>
                  <p className="text-sm text-slate-500">Costa Kudus Tech</p>
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
                  <label className="mb-2 block text-sm font-medium">Client Name</label>
                  <input value={clientName} onChange={(e) => setClientName(e.target.value)}
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Phone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Service / Task</label>
                  <input value={service} onChange={(e) => setService(e.target.value)}
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Total Job Amount (GH₵)</label>
                  <input type="number" value={jobAmount} onChange={(e) => setJobAmount(e.target.value)}
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Amount Paid (GH₵)</label>
                  <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Payment Method</label>
                  <select value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as Payment["paymentMethod"])}
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Cash</option>
                    <option>Mobile Money</option>
                    <option>Bank Transfer</option>
                    <option>Card</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Payment Date</label>
                  <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    className="w-full resize-none rounded-xl border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional notes..." />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t p-6">
                <button onClick={() => { resetForm(); setShowForm(false); }}
                  className="rounded-xl border px-5 py-3">
                  Cancel
                </button>
                <button onClick={handleSaveReceipt}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                  {editingPayment ? "Update Receipt" : "Save Receipt"}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-8 w-full max-w-3xl">
              <div className="print-receipt rounded-2xl bg-white shadow-2xl">

                <div className="border-b-4 border-slate-800 p-8">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <Image src={company.logo} alt={company.companyName} width={85} height={85}
                        className="rounded-xl object-contain" />
                      <div>
                        <h1 className="text-3xl font-bold text-slate-900">{company.companyName}</h1>
                        <p className="font-medium text-blue-600">{company.tagline}</p>
                        <p className="mt-2 text-sm text-slate-600">{company.address}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <h2 className="text-3xl font-bold tracking-wider text-slate-800">RECEIPT</h2>
                      <p className="mt-2 font-semibold text-blue-600">
                        RCT-{viewingReceipt.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Date: {formatDate(viewingReceipt.paymentDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-2 border-t pt-4 text-sm text-slate-600 md:grid-cols-2">
                    <div><strong>Phone:</strong> {company.phone}</div>
                    <div><strong>WhatsApp:</strong> {company.whatsapp}</div>
                    <div><strong>Email:</strong> {company.email}</div>
                    <div><strong>Website:</strong> {company.website}</div>
                    <div><strong>TikTok:</strong> {company.socialMedia}</div>
                  </div>
                </div>

                <div className="grid gap-6 p-8 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Received From</p>
                    <p className="text-lg font-bold text-slate-800">{viewingReceipt.clientName}</p>
                    <p className="text-slate-600">{viewingReceipt.phone}</p>
                  </div>
                  <div className="md:text-right">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Payment Method</p>
                    <p className="font-semibold text-slate-800">{viewingReceipt.paymentMethod}</p>
                  </div>
                </div>

                <div className="px-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-left text-white">
                        <th className="rounded-l-lg p-4">Description</th>
                        <th className="p-4 text-right">Amount Paid</th>
                        <th className="rounded-r-lg p-4 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-5">
                          <p className="font-semibold text-slate-800">{viewingReceipt.service}</p>
                          {viewingReceipt.notes && (
                            <p className="mt-1 text-sm text-slate-500">{viewingReceipt.notes}</p>
                          )}
                        </td>
                        <td className="p-5 text-right font-semibold">
                          GH₵ {Number(viewingReceipt.amountPaid).toFixed(2)}
                        </td>
                        <td className="p-5 text-right font-semibold">
                          GH₵ {Number(viewingReceipt.balance).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end px-8 py-6">
                  <div className="w-full md:w-80">
                    <div className="flex justify-between border-t-2 border-slate-800 pt-4">
                      <span className="text-xl font-bold">Amount Paid</span>
                      <span className="text-2xl font-bold text-blue-600">
                        GH₵ {Number(viewingReceipt.amountPaid).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="font-semibold text-slate-800">Thank you for your payment.</p>
                    <p className="mt-1 text-sm text-slate-500">
                      This receipt confirms payment received by {company.companyName}.
                    </p>
                  </div>
                </div>

                <div className="grid gap-12 px-8 pb-10 pt-4 md:grid-cols-2">
                  <div>
                    <div className="h-12 border-b border-slate-800" />
                    <p className="mt-2 font-semibold text-slate-800">Customer Signature</p>
                    <p className="text-sm text-slate-500">Name: {viewingReceipt.clientName}</p>
                    <p className="text-sm text-slate-500">Date: {formatDate(viewingReceipt.paymentDate)}</p>
                  </div>

                  <div>
                    <div className="h-12 border-b border-slate-800" />
                    <p className="mt-2 font-semibold text-slate-800">Attendant Signature</p>
                    <p className="text-sm text-slate-500">For: {company.companyName}</p>
                    <p className="text-sm text-slate-500">Date: {formatDate(viewingReceipt.paymentDate)}</p>
                  </div>
                </div>

                <div className="border-t bg-slate-50 px-8 py-6 text-center">
                  <p className="font-semibold text-slate-800">
                    Thank you for doing business with {company.companyName}.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {company.website} • TikTok: {company.socialMedia}
                  </p>
                </div>

                <div className="no-print flex justify-end gap-3 border-t p-6">
                  <button onClick={() => window.print()}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
                    <Printer size={18} />
                    Print / Save PDF
                  </button>
                  <button onClick={() => setViewingReceipt(null)}
                    className="rounded-xl bg-slate-800 px-5 py-3 font-medium text-white hover:bg-slate-900">
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