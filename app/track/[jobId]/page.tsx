"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Loader2,
  Wrench,
  XCircle,
} from "lucide-react";

import { getJobs } from "@/lib/jobService";
import { Job } from "@/lib/jobTypes";

const statusSteps = ["Pending", "In Progress", "Completed"];

function getStatusIndex(status: string) {
  const index = statusSteps.findIndex(
    (step) => step.toLowerCase() === status.toLowerCase()
  );
  return index === -1 ? 0 : index;
}

function formatMoney(value: number) {
  return `GH₵ ${value.toFixed(2)}`;
}

export default function TrackJobPage() {
  const params = useParams();
  const rawJobId = params?.jobId;

  const jobId = Array.isArray(rawJobId) ? rawJobId[0] : rawJobId;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!jobId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const jobs = await getJobs();

        const found = jobs.find(
          (item) =>
            String(item.jobNumber || "").toLowerCase() ===
              String(jobId).toLowerCase() ||
            String(item.id || "").toLowerCase() ===
              String(jobId).toLowerCase()
        );

        if (found) {
          setJob(found);
          setNotFound(false);
        } else {
          setJob(null);
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error loading tracked job:", error);
        setJob(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading your customer portal...</p>
        </div>
      </main>
    );
  }

  if (notFound || !job) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>

          <h1 className="text-xl font-bold text-slate-900">Job Not Found</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            We could not find the job associated with this tracking link.
          </p>
        </div>
      </main>
    );
  }

  const currentStatus = job.jobStatus || "Pending";
  const currentStep = getStatusIndex(currentStatus);

  const amount = Number(job.amount || 0);
  const paymentStatus = job.paymentStatus || "Unpaid";

  // Supports common payment field names used in job records.
  const amountPaid = Number(
    (job as Job & { amountPaid?: number; paidAmount?: number }).amountPaid ??
      (job as Job & { paidAmount?: number }).paidAmount ??
      (paymentStatus.toLowerCase() === "paid" ? amount : 0)
  );

  const amountRemaining = Math.max(amount - amountPaid, 0);

  const customerName =
    job.clientName || (job as Job & { fullName?: string }).fullName || "Customer";

  const firstName = customerName.split(" ")[0];

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Customer portal header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[82px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="flex h-full w-full items-center justify-center text-blue-600">
                <Wrench className="h-6 w-6" />
              </div>
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Costa Kudus Tech
              </h1>
              <p className="text-sm text-slate-500">Customer Portal</p>
            </div>
          </div>

          <div className="hidden items-center gap-4 sm:flex">
            <div className="rounded-2xl bg-slate-100 px-5 py-3 text-right">
              <p className="text-xs text-slate-500">Customer Job Tracking</p>
              <p className="text-sm font-semibold text-slate-800">
                {job.jobNumber || job.id}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500">Customer</p>
                <p className="text-sm font-bold text-slate-900">
                  {customerName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8">
        {/* Welcome banner */}
        <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-9 text-white shadow-lg">
          <div className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 right-20 h-52 w-52 rounded-full bg-white/10" />

          <div className="relative z-10">
            <p className="text-sm text-white/90">Welcome back,</p>
            <h2 className="mt-1 text-3xl font-bold sm:text-4xl">{firstName}</h2>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/90 sm:text-base">
              Welcome to your Costa Kudus Tech customer portal. Here you can
              monitor your work progress and check your payment information.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Current Status
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  {currentStatus}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Payment Status
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm font-bold">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      paymentStatus.toLowerCase() === "paid"
                        ? "bg-emerald-400"
                        : "bg-amber-300"
                    }`}
                  />
                  {paymentStatus}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5" />
            </div>

            <p className="mt-7 text-sm text-white/90">Current Job</p>
            <p className="mt-1 truncate text-lg font-bold">
              {job.service || "Service"}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <CreditCard className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase">Total</span>
            </div>

            <p className="mt-7 text-sm text-white/90">Job Total</p>
            <p className="mt-1 text-2xl font-bold">{formatMoney(amount)}</p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase">Paid</span>
            </div>

            <p className="mt-7 text-sm text-white/90">Amount Paid</p>
            <p className="mt-1 text-2xl font-bold">
              {formatMoney(amountPaid)}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Clock3 className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold uppercase">Balance</span>
            </div>

            <p className="mt-7 text-sm text-white/90">Amount Remaining</p>
            <p className="mt-1 text-2xl font-bold">
              {formatMoney(amountRemaining)}
            </p>
          </div>
        </section>

        {/* Job details */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Job</h3>
                <p className="text-sm text-slate-500">
                  Current service information
                </p>
              </div>
            </div>

            <span className="w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {currentStatus}
            </span>
          </div>

          {/* Progress tracker */}
          <div className="mt-8">
            <div className="flex items-center">
              {statusSteps.map((step, index) => {
                const completed = index <= currentStep;

                return (
                  <div key={step} className="flex flex-1 items-center">
                    {index > 0 && (
                      <div
                        className={`h-1 flex-1 ${
                          index <= currentStep
                            ? "bg-blue-600"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        completed
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {index === 0 && <Clock3 className="h-5 w-5" />}
                      {index === 1 && <Wrench className="h-5 w-5" />}
                      {index === 2 && (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>

                    {index < statusSteps.length - 1 && (
                      <div
                        className={`h-1 flex-1 ${
                          index < currentStep
                            ? "bg-blue-600"
                            : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex justify-between text-xs font-medium">
              {statusSteps.map((step, index) => (
                <span
                  key={step}
                  className={
                    index <= currentStep
                      ? "text-blue-700"
                      : "text-slate-400"
                  }
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          {/* Information */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-500">
                <FileText className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Service
                </span>
              </div>
              <p className="mt-2 font-semibold text-slate-900">
                {job.service || "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-500">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Payment
                </span>
              </div>
              <p className="mt-2 font-semibold text-slate-900">
                {paymentStatus}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Job ID
              </p>
              <p className="mt-2 font-semibold text-blue-600">
                {job.jobNumber || job.id}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Customer
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {customerName}
              </p>
            </div>
          </div>

          {job.serviceDetails && (
            <div className="mt-4 rounded-xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Job Details
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {job.serviceDetails}
              </p>
            </div>
          )}
        </section>

        <footer className="py-6 text-center text-xs text-slate-400">
          Costa Kudus Tech • Thank you for choosing us.
        </footer>
      </div>
    </main>
  );
}
