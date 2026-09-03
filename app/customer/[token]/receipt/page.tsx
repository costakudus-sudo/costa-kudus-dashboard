"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { getClients } from "../../../../lib/clientService";
import { Client } from "../../../../lib/types";
import {
  CompanySettings,
  defaultSettings,
  getCompanySettings,
} from "../../../../lib/settingsService";

interface PaymentTransaction {
  reference: string;
  clientId: string;
  clientName?: string;
  email?: string;
  amount: number;
  amountApplied?: number;
  currency?: string;
  status?: string;
  channel?: string;
  paidAt?: string | null;
  createdAt?: any;
}

export default function CustomerReceiptPage() {
  const params = useParams();
  const token = String(params.token);

  const [client, setClient] = useState<Client | null>(null);
  const [payment, setPayment] =
    useState<PaymentTransaction | null>(null);
  const [settings, setSettings] =
    useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReceipt = async () => {
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

        if (!foundClient) {
          setLoading(false);
          return;
        }

        setClient(foundClient);

        if (companySettings) {
          setSettings(companySettings);
        }

        /*
         * The payment transaction is loaded through the
         * server-side receipt API using the customer's
         * portal token.
         */
        const response = await fetch(
          `/api/payments/receipt?portalToken=${encodeURIComponent(
            token
          )}`,
          {
            cache: "no-store",
          }
        );

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.payment) {
            setPayment(data.payment);
          }
        }
      } catch (error) {
        console.error(
          "Error loading customer receipt:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadReceipt();
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
            Loading receipt...
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
            Receipt Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            We could not find your customer portal.
          </p>

          <Link
            href={`/customer/${token}`}
            className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            No Payment Receipt
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            There is no completed payment transaction available
            for this customer portal yet.
          </p>

          <Link
            href={`/customer/${token}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  const amountPaid = Number(
    payment.amountApplied ?? payment.amount ?? 0
  );

  const total = Number(
    client.total ??
      Number(client.amount || 0) -
        Number(client.discount || 0)
  );

  const balance = Number(
    client.balance ??
      Math.max(total - Number(client.amountPaid || 0), 0)
  );

  const receiptNumber = `RCT-${payment.reference
    .slice(-8)
    .toUpperCase()}`;

  const paymentDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      {/* ACTION BAR */}
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between px-4 print:hidden">
        <Link
          href={`/customer/${token}`}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back to Portal
        </Link>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Printer size={17} />
          Print / Save PDF
        </button>
      </div>

      {/* RECEIPT */}
      <div className="mx-auto max-w-4xl overflow-hidden bg-white shadow-xl print:max-w-none print:shadow-none">
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
                <h1 className="text-2xl font-black">
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
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                Payment Receipt
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {receiptNumber}
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                {paymentDate}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-10 sm:px-12">
          {/* SUCCESS MESSAGE */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-green-100 p-2 text-green-600">
                <CheckCircle2 size={24} />
              </div>

              <div>
                <h3 className="font-bold text-green-900">
                  Payment Successful
                </h3>

                <p className="mt-1 text-sm text-green-700">
                  Your payment has been successfully received
                  and recorded.
                </p>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Customer
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {client.fullName}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {client.phone}
              </p>

              {client.email && (
                <p className="mt-1 text-sm text-slate-500">
                  {client.email}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Payment Reference
              </p>

              <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-900">
                {payment.reference}
              </p>
            </div>
          </div>

          {/* PAYMENT DETAILS */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-12 bg-slate-900 px-5 py-4 text-xs font-bold uppercase tracking-wider text-white">
              <div className="col-span-8">
                Payment Details
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

                <div className="mt-3 space-y-1 text-sm text-slate-500">
                  <p>
                    Payment method:{" "}
                    <span className="font-semibold capitalize text-slate-700">
                      {payment.channel || "Online Payment"}
                    </span>
                  </p>

                  <p>
                    Currency:{" "}
                    {payment.currency || "GHS"}
                  </p>

                  <p>
                    Payment status:{" "}
                    <span className="font-semibold text-green-600">
                      Successful
                    </span>
                  </p>
                </div>
              </div>

              <div className="col-span-4 text-right">
                <p className="text-xl font-black text-slate-900">
                  GH₵ {amountPaid.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* BALANCE SUMMARY */}
          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Total Job Amount</span>

                <span>
                  GH₵ {total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-green-600">
                <span>Total Paid</span>

                <span>
                  GH₵{" "}
                  {Number(
                    client.amountPaid || 0
                  ).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between rounded-xl bg-slate-900 px-4 py-4 text-lg font-black text-white">
                <span>Balance Remaining</span>

                <span>
                  GH₵ {balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER NOTE */}
          <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm leading-6 text-blue-800">
              Thank you for your payment and for choosing{" "}
              <span className="font-bold">
                {settings.companyName}
              </span>
              . Please keep this receipt for your records.
            </p>
          </div>

          {/* SIGNATURE */}
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
            {settings.companyName}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            This is a computer-generated payment receipt.
          </p>
        </div>
      </div>
    </div>
  );
}