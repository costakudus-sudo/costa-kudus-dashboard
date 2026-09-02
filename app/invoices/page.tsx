"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  AlertCircle,
} from "lucide-react";

import { getClients } from "../../lib/clientService";
import { Client } from "../../lib/types";
import {
  CompanySettings,
  defaultSettings,
  getCompanySettings,
} from "../../lib/settingsService";

const getSocialDisplay = (value: string) => {
  if (!value) return "";

  const trimmed = value.trim();

  if (trimmed.startsWith("@")) {
    return trimmed;
  }

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
    // Fall back to saved value.
  }

  return trimmed;
};

const formatDate = (value: any) => {
  if (!value) return "—";

  if (value?.seconds) {
    return new Date(
      value.seconds * 1000
    ).toLocaleDateString("en-GB");
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("en-GB");
  }

  return String(value);
};

export default function CustomerInvoicePage() {
  const params = useParams();
  const router = useRouter();

  const token = params.token as string;

  const [client, setClient] =
    useState<Client | null>(null);

  const [company, setCompany] =
    useState<CompanySettings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);

        const [clients, companyData] =
          await Promise.all([
            getClients(),
            getCompanySettings(),
          ]);

        const foundClient = clients.find(
          (item) =>
            item.portalToken === token &&
            item.portalEnabled === true
        );

        if (!foundClient) {
          setError(
            "This customer portal link is invalid or has been disabled."
          );
          return;
        }

        setClient(foundClient);
        setCompany(companyData);
      } catch (err) {
        console.error(
          "Customer invoice error:",
          err
        );

        setError(
          "Unable to load your invoice. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadInvoice();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">
            Costa Kudus Tech
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Loading your invoice...
          </p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle
              size={42}
              className="text-red-500"
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Invoice Unavailable
          </h1>

          <p className="mt-3 leading-6 text-slate-500">
            {error ||
              "We could not find your invoice."}
          </p>
        </div>
      </div>
    );
  }

  const subtotal = Number(client.amount || 0);

  const discount = Number(
    client.discount || 0
  );

  const total = Number(
    client.total ??
      subtotal - discount
  );

  const amountPaid = Number(
    client.amountPaid || 0
  );

  const balance = Number(
    client.balance ??
      total - amountPaid
  );

  const invoiceNumber = `INV-${client.id
    .slice(-6)
    .toUpperCase()}`;

  return (
    <>
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

      <main className="min-h-screen bg-slate-100 p-4 sm:p-8">

        {/* TOP ACTIONS */}

        <div className="no-print mx-auto mb-6 flex max-w-4xl items-center justify-between gap-3">
          <button
            onClick={() =>
              router.push(
                `/customer/${token}`
              )
            }
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
            Back to Portal
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-blue-700"
          >
            <Printer size={18} />
            Print / Save PDF
          </button>
        </div>

        {/* INVOICE */}

        <div className="print-invoice mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* COMPANY HEADER */}

          <div className="border-b-4 border-slate-800 p-6 sm:p-8">

            <div className="flex flex-col justify-between gap-6 sm:flex-row">

              <div className="flex items-center gap-4">

                <img
                  src={company.logo || "/logo.png"}
                  alt={company.companyName}
                  className="h-20 w-20 rounded-xl object-contain"
                />

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
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

              <div className="text-left sm:text-right">

                <h2 className="text-3xl font-bold tracking-wider text-slate-800">
                  INVOICE
                </h2>

                <p className="mt-2 font-semibold text-blue-600">
                  {invoiceNumber}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Date:{" "}
                  {formatDate(
                    client.createdAt
                  )}
                </p>

              </div>

            </div>

            {/* CONTACT DETAILS */}

            <div className="mt-6 grid gap-2 border-t pt-4 text-sm text-slate-600 sm:grid-cols-2">

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
                {getSocialDisplay(
                  company.socialMedia
                )}
              </div>

            </div>

          </div>

          {/* CUSTOMER */}

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Bill To
              </p>

              <p className="text-lg font-bold text-slate-800">
                {client.fullName}
              </p>

              <p className="text-slate-600">
                {client.phone}
              </p>

              {client.email && (
                <p className="text-sm text-slate-500">
                  {client.email}
                </p>
              )}
            </div>

            <div className="sm:text-right">

              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Status
              </p>

              <span
                className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${
                  client.paymentStatus ===
                  "Paid"
                    ? "bg-green-100 text-green-700"
                    : client.paymentStatus ===
                      "Part Payment"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {client.paymentStatus}
              </span>

            </div>

          </div>

          {/* SERVICE TABLE */}

          <div className="px-6 sm:px-8">

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
                      {client.service}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {client.serviceDetails ||
                        `Professional service provided by ${company.companyName}.`}
                    </p>

                  </td>

                  <td className="p-5 text-right font-semibold">
                    GH₵{" "}
                    {subtotal.toFixed(2)}
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

          {/* TOTALS */}

          <div className="flex justify-end px-6 py-6 sm:px-8">

            <div className="w-full space-y-3 sm:w-96">

              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>

                <span>
                  GH₵{" "}
                  {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-red-600">
                <span>Discount</span>

                <span>
                  - GH₵{" "}
                  {discount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-t-2 border-slate-800 pt-4">

                <span className="text-xl font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  GH₵{" "}
                  {total.toFixed(2)}
                </span>

              </div>

              <div className="flex justify-between text-green-600">
                <span>Amount Paid</span>

                <span>
                  GH₵{" "}
                  {amountPaid.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-t pt-3 font-bold text-red-600">

                <span>Balance</span>

                <span>
                  GH₵{" "}
                  {balance.toFixed(2)}
                </span>

              </div>

            </div>

          </div>

          {/* SIGNATURES */}

          <div className="grid gap-12 px-6 pb-10 pt-4 sm:grid-cols-2 sm:px-8">

            <div>
              <div className="h-12 border-b border-slate-800" />

              <p className="mt-2 font-semibold text-slate-800">
                Customer Signature
              </p>

              <p className="text-sm text-slate-500">
                Name: {client.fullName}
              </p>

              <p className="text-sm text-slate-500">
                Date:{" "}
                {formatDate(client.createdAt)}
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
                Date:{" "}
                {formatDate(client.createdAt)}
              </p>
            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t bg-slate-50 px-6 py-6 text-center sm:px-8">

            <p className="font-semibold text-slate-800">
              Thank you for doing business
              with {company.companyName}.
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {company.website} • TikTok:{" "}
              {getSocialDisplay(
                company.socialMedia
              )}
            </p>

          </div>

        </div>

      </main>
    </>
  );
}