"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

import { getClients } from "../../../../lib/clientService";
import { Client } from "../../../../lib/types";
import {
  CompanySettings,
  defaultSettings,
  getCompanySettings,
} from "../../../../lib/settingsService";

export default function CustomerInvoicePage() {
  const params = useParams();
  const token = String(params.token);

  const [client, setClient] = useState<Client | null>(null);
  const [settings, setSettings] =
    useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const [clients, companySettings] = await Promise.all([
          getClients(),
          getCompanySettings(),
        ]);

        const foundClient = clients.find(
          (item) =>
            item.portalToken === token &&
            item.portalEnabled === true
        );

        if (foundClient) {
          setClient(foundClient);
        }

        if (companySettings) {
          setSettings(companySettings);
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadInvoice();
    }
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading invoice...
          </p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Invoice Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            We could not find an invoice associated with this
            customer portal.
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const subtotal = Number(client.amount || 0);
  const discount = Number(client.discount || 0);

  const total = Number(
    client.total ?? subtotal - discount
  );

  const amountPaid = Number(client.amountPaid || 0);

  const balance = Math.max(
    Number(client.balance ?? total - amountPaid),
    0
  );

  const invoiceNumber = `INV-${client.id
    .slice(-6)
    .toUpperCase()}`;

  const status = client.paymentStatus;

  const getStatusIcon = () => {
    if (status === "Paid") {
      return <CheckCircle2 size={18} />;
    }

    if (status === "Part Payment") {
      return <Clock size={18} />;
    }

    return <AlertCircle size={18} />;
  };

  const getStatusClass = () => {
    if (status === "Paid") {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (status === "Part Payment") {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }

    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      {/* TOP ACTION BAR */}
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between px-4 print:hidden">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back to Portal
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Printer size={17} />
          Print / Save PDF
        </button>
      </div>

      {/* INVOICE */}
      <div
        id="customer-invoice"
        className="mx-auto max-w-5xl overflow-hidden bg-white shadow-xl print:max-w-none print:shadow-none"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 px-8 py-8 text-white sm:px-12">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div className="flex items-start gap-4">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.companyName}
                  className="h-16 w-16 rounded-xl bg-white object-contain p-2"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-xl font-black text-blue-700">
                  CK
                </div>
              )}

              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  {settings.companyName}
                </h1>

                {settings.tagline && (
                  <p className="mt-1 text-sm text-blue-200">
                    {settings.tagline}
                  </p>
                )}

                <div className="mt-3 space-y-1 text-xs text-slate-300">
                  {settings.address && (
                    <p>{settings.address}</p>
                  )}

                  {settings.phone && (
                    <p>Phone: {settings.phone}</p>
                  )}

                  {settings.whatsapp && (
                    <p>WhatsApp: {settings.whatsapp}</p>
                  )}

                  {settings.email && (
                    <p>Email: {settings.email}</p>
                  )}

                  {settings.website && (
                    <p>{settings.website}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                Invoice
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {invoiceNumber}
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                Date:{" "}
                {client.createdAt
                  ? new Date(
                      client.createdAt as any
                    ).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-10 sm:px-12">
          {/* BILL TO / PAYMENT STATUS */}
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Bill To
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {client.fullName}
              </h3>

              <div className="mt-2 space-y-1 text-sm text-slate-500">
                <p>{client.phone}</p>

                {client.email && (
                  <p>{client.email}</p>
                )}

                {client.address && (
                  <p>{client.address}</p>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Payment Status
              </p>

              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getStatusClass()}`}
              >
                {getStatusIcon()}
                {status}
              </div>
            </div>
          </div>

          {/* SERVICE TABLE */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-12 bg-slate-900 px-5 py-4 text-xs font-bold uppercase tracking-wider text-white">
              <div className="col-span-8">
                Service
              </div>

              <div className="col-span-4 text-right">
                Amount
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 px-5 py-6">
              <div className="col-span-8">
                <h4 className="font-bold text-slate-900">
                  {client.service}
                </h4>

                {client.serviceDetails && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-500">
                    {client.serviceDetails}
                  </p>
                )}
              </div>

              <div className="col-span-4 text-right font-semibold text-slate-900">
                GH₵ {subtotal.toFixed(2)}
              </div>
            </div>
          </div>

          {/* TOTALS */}
          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>
                  GH₵ {subtotal.toFixed(2)}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Discount</span>
                  <span>
                    - GH₵ {discount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                <span>Total</span>
                <span>
                  GH₵ {total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-green-600">
                <span>Amount Paid</span>
                <span>
                  GH₵ {amountPaid.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-900 px-4 py-4 text-lg font-black text-white">
                <span>Balance Due</span>
                <span>
                  GH₵ {balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* PAYMENT MESSAGE */}
          <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <h4 className="font-bold text-blue-900">
              Payment Information
            </h4>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              Thank you for doing business with{" "}
              {settings.companyName}. Please retain this
              invoice for your records.
            </p>

            {balance > 0 && (
              <p className="mt-2 text-sm font-semibold text-blue-900">
                Outstanding balance: GH₵{" "}
                {balance.toFixed(2)}
              </p>
            )}
          </div>

          {/* SIGNATURES */}
          <div className="mt-16 grid gap-12 sm:grid-cols-2">
            <div>
              <div className="border-b border-slate-300 pb-2" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Customer Signature
              </p>
            </div>

            <div>
              <div className="border-b border-slate-300 pb-2" />
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Authorized Signature
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 text-center sm:px-12">
          <p className="text-sm font-semibold text-slate-700">
            Thank you for choosing {settings.companyName}.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            This is a computer-generated invoice.
          </p>
        </div>
      </div>
    </div>
  );
}