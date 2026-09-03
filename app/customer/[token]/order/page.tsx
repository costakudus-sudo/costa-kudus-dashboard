"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Send,
  User,
  Briefcase,
  FileText,
} from "lucide-react";

import { getClients } from "../../../../lib/clientService";
import { Client } from "../../../../lib/types";

const services = [
  "Internet Browsing",
  "Online Registration",
  "Printing",
  "Photocopying & Scanning",
  "Passport Picture",
  "CV & Cover Letter",
  "Lamination",
  "Typing & Document Formatting",
  "Graphic Design",
  "Social Media Account Setup",
  "Software Installation",
  "Phone & Laptop Setup",
  "Other",
];

export default function CustomerOrderPage() {
  const params = useParams();
  const router = useRouter();

  const token = String(params.token);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [service, setService] = useState("");
  const [details, setDetails] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadClient = async () => {
      try {
        const clients = await getClients();

        const foundClient = clients.find(
          (item) =>
            item.portalToken === token &&
            item.portalEnabled === true
        );

        if (!foundClient) {
          setError("Customer portal could not be verified.");
          return;
        }

        setClient(foundClient);
      } catch (err) {
        console.error(err);
        setError("Unable to load your customer information.");
      } finally {
        setLoading(false);
      }
    };

    loadClient();
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!client) {
      setError("Customer information could not be verified.");
      return;
    }

    if (!service) {
      setError("Please select a service.");
      return;
    }

    if (!details.trim()) {
      setError("Please describe what you need.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portalToken: token,
          clientId: client.id,
          clientName: client.fullName,
          phone: client.phone,
          email: client.email || "",
          service,
          serviceDetails: details,
          preferredDate,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit your request."
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting your request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
            <Loader2 className="animate-spin" size={22} />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading your order page...
          </p>
        </div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Briefcase size={26} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900">
            Unable to Open Order Page
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <Link
            href={`/customer/${token}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:p-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
              <CheckCircle2 size={42} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900">
              Request Submitted Successfully
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Thank you, {client?.fullName}. Your job request has been
              submitted to Costa Kudus Tech. We will review your request
              and contact you with the next steps.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/customer/${token}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft size={17} />
                Back to Portal
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setService("");
                  setDetails("");
                  setPreferredDate("");
                  setNotes("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-lg font-bold text-slate-900">
              Costa Kudus Tech
            </p>

            <p className="text-xs text-slate-500">
              Customer Portal
            </p>
          </div>

          <Link
            href={`/customer/${token}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">
              Back to Portal
            </span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Briefcase size={23} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Order a New Job
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tell us what you need and our team will review your request.
          </p>
        </div>

        {/* Customer Information */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <User size={20} />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Customer
              </p>

              <p className="font-semibold text-slate-900">
                {client?.fullName}
              </p>

              <p className="text-sm text-slate-500">
                {client?.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Order Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"
        >
          <div className="mb-7">
            <h2 className="text-lg font-bold text-slate-900">
              Job Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Provide the information below so we can understand your
              request.
            </p>
          </div>

          <div className="space-y-6">
            {/* Service */}
            <div>
              <label
                htmlFor="service"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Service
              </label>

              <select
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                required
              >
                <option value="">Select a service</option>

                {services.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Details */}
            <div>
              <label
                htmlFor="details"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <FileText size={16} />
                What do you need?
              </label>

              <textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={5}
                placeholder="Describe the work you want us to do..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                required
              />
            </div>

            {/* Preferred Date */}
            <div>
              <label
                htmlFor="preferredDate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Preferred Date
                <span className="ml-2 font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <input
                id="preferredDate"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Additional Notes
                <span className="ml-2 font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Anything else we should know?"
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Job Request
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">
          Your request will be reviewed by Costa Kudus Tech before
          any work begins.
        </p>
      </main>
    </div>
  );
}