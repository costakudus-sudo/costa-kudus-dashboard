"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  Phone,
  Receipt,
  User,
  X,
} from "lucide-react";

import { getClients } from "../../../lib/clientService";
import { getJobs, addJob } from "../../../lib/jobService";
import { Client } from "../../../lib/types";

export default function CustomerPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderService, setOrderService] = useState("");
  const [orderDetails, setOrderDetails] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const clients = await getClients();

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
      } catch (err) {
        console.error("Customer portal error:", err);
        setError(
          "Unable to load your portal. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadCustomer();
    }
  }, [token]);

    // Verify Paystack payment after customer returns from checkout
  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");

      if (!reference) return;

      try {
        const response = await fetch(
          `/api/payments/verify?reference=${encodeURIComponent(reference)}`
        );

        const data = await response.json();

        if (data.success) {
          alert("Payment successful! Your payment is being processed.");
        } else {
          alert("Payment could not be verified.");
        }

        // Remove payment reference from the URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (error) {
        console.error("Payment verification error:", error);
        alert("Unable to verify your payment.");
      }
    };

    verifyPayment();
  }, []);

  const SERVICES = [
    "High-Speed Internet Browsing",
    "Online Registrations",
    "Printing",
    "Photocopying",
    "Scanning",
    "Passport Picture Services",
    "CV & Cover Letter Writing",
    "Lamination Services",
    "Typing & Document Formatting",
    "Graphic Design",
    "Social Media Account Setup & Management",
    "Software Installation & Updates",
    "Phone & Laptop Setup Assistance",
  ];

  const submitNewJob = async () => {
    if (!orderService) {
      alert("Please select a service.");
      return;
    }

    try {
      setSubmittingOrder(true);

      const jobs = await getJobs();
      const numbers = jobs
        .map((item: any) => {
          const value = String(item.jobNumber || item.jobId || "");
          const match = value.match(/^JOB-(\d+)$/);
          return match ? Number(match[1]) : 0;
        })
        .filter((number) => number > 0);

      const nextNumber = numbers.length > 0
        ? Math.max(...numbers) + 1
        : jobs.length + 1;

      const jobNumber = `JOB-${String(nextNumber).padStart(4, "0")}`;

      await addJob({
        clientId: String((client as any).id || ""),
        clientName: client?.fullName || "Customer",
        phone: client?.phone || "",
        email: client?.email || "",
        service: orderService,
        serviceDetails: orderDetails.trim() || "Customer requested this service through the customer portal.",
        amount: 0,
        total: 0,
        amountPaid: 0,
        balance: 0,
        jobStatus: "Pending",
        paymentStatus: "Unpaid",
        source: "Customer Portal",
        requestStatus: "New",
      } as any);

      setOrderOpen(false);
      setOrderService("");
      setOrderDetails("");

      alert(`Your new service request has been submitted successfully.\n\nJob ID: ${jobNumber}\n\nCosta Kudus Tech will review your request and update you.`);
    } catch (error) {
      console.error("New job request error:", error);
      alert("Unable to submit your new job request. Please try again.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Live date and time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
            <img
              src="/logo.png"
              alt="Costa Kudus Tech"
              className="h-12 w-12 object-contain"
            />
          </div>

          <h1 className="text-xl font-bold text-slate-900">
            Costa Kudus Tech
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Loading your customer portal...
          </p>

          <div className="mx-auto mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={42} className="text-red-500" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Portal Unavailable
          </h1>

          <p className="mt-3 leading-6 text-slate-500">
            {error ||
              "We could not find your customer portal."}
          </p>

          <p className="mt-6 text-sm text-slate-400">
            Please contact Costa Kudus Tech if you believe this
            is an error.
          </p>
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

  const balance = Number(
    client.balance ?? total - amountPaid
  );

  const status = client.jobStatus || "Pending";

  const statusSteps = [
    "Pending",
    "In Progress",
    "Completed",
    "Delivered",
  ];

  const currentStep = statusSteps.indexOf(status);

  const dateText = currentTime.toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const timeText = currentTime.toLocaleTimeString(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );

  const firstName =
    client.fullName?.split(" ")[0] ||
    client.fullName;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="flex min-h-[82px] items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
                <img
                  src="/logo.png"
                  alt="Costa Kudus Tech"
                  className="h-11 w-11 object-contain"
                />
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Costa Kudus Tech
                </h1>

                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Customer Portal
                </p>
              </div>
            </div>

            {/* Desktop information */}
            <div className="hidden items-center gap-4 md:flex">

              {/* Date & Time */}
              <div className="rounded-2xl bg-slate-100 px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-500">
                  <CalendarDays size={14} />
                  {dateText}
                </div>

                <div className="mt-1 flex items-center justify-end gap-2 text-sm font-bold text-slate-900">
                  <Clock size={14} className="text-blue-600" />
                  {timeText}
                </div>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {client.fullName?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Customer
                  </p>

                  <p className="font-semibold text-slate-900">
                    {client.fullName}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-xl bg-slate-100 p-3 md:hidden"
            >
              {mobileMenu ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>

          {/* Mobile information */}
          {mobileMenu && (
            <div className="border-t border-slate-200 py-4 md:hidden">
              <div className="grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {dateText}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-4">
                  <p className="text-xs text-slate-500">
                    Current Time
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {timeText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =================================================
            WELCOME BANNER
        ================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 p-6 text-white shadow-xl sm:p-8">

          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-white/10" />

           <div className="relative z-10 max-w-3xl">
            <p className="text-sm font-medium text-blue-100">
              Welcome back,
            </p>

            <h2 className="mt-1 text-3xl font-bold sm:text-4xl">
              {firstName}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Welcome to your Costa Kudus Tech customer portal.
              Here you can monitor your work progress, check
              payments and manage your services.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {/* Current Status */}
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
                  Current Status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      status === "Completed" || status === "Delivered"
                        ? "bg-emerald-400"
                        : status === "In Progress"
                        ? "bg-orange-400"
                        : status === "Cancelled"
                        ? "bg-red-400"
                        : "bg-yellow-400"
                    }`}
                  />

                  <span className="text-sm font-bold text-white">
                    {status}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wider text-blue-200">
                  Payment Status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      client.paymentStatus === "Paid"
                        ? "bg-emerald-400"
                        : client.paymentStatus === "Part Payment"
                        ? "bg-orange-400"
                        : "bg-red-400"
                    }`}
                  />

                  <span className="text-sm font-bold text-white">
                    {client.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Job */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-white/15 p-3">
                <Briefcase size={24} />
              </div>

              <ArrowRight size={18} className="opacity-70" />
            </div>

            <p className="mt-5 text-sm text-blue-100">
              Current Job
            </p>

            <p className="mt-1 truncate text-lg font-bold">
              {client.service}
            </p>
          </div>

          {/* Total */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-white/15 p-3">
                <CreditCard size={24} />
              </div>

              <span className="text-xs font-semibold">
                TOTAL
              </span>
            </div>

            <p className="mt-5 text-sm text-orange-100">
              Job Total
            </p>

            <p className="mt-1 text-2xl font-bold">
              GH₵ {total.toFixed(2)}
            </p>
          </div>

          {/* Paid */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-white/15 p-3">
                <CheckCircle2 size={24} />
              </div>

              <span className="text-xs font-semibold">
                PAID
              </span>
            </div>

            <p className="mt-5 text-sm text-green-100">
              Amount Paid
            </p>

            <p className="mt-1 text-2xl font-bold">
              GH₵ {amountPaid.toFixed(2)}
            </p>
          </div>

          {/* Balance */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-700 p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-white/15 p-3">
                <Clock size={24} />
              </div>

              <span className="text-xs font-semibold">
                BALANCE
              </span>
            </div>

            <p className="mt-5 text-sm text-purple-100">
              Amount Remaining
            </p>

            <p className="mt-1 text-2xl font-bold">
              GH₵ {balance.toFixed(2)}
            </p>
          </div>
        </section>

        {/* =================================================
            JOB INFORMATION
        ================================================= */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3">
                <Briefcase
                  size={24}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Your Job
                </h2>

                <p className="text-sm text-slate-500">
                  Current service information
                </p>
              </div>
            </div>

            <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {status}
            </div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Service
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {client.service}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Phone
              </p>

              <div className="mt-2 flex items-center gap-2">
                <Phone size={17} className="text-blue-600" />

                <p className="text-lg font-bold text-slate-900">
                  {client.phone}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Service Details
              </p>

              <p className="mt-2 leading-7 text-slate-700">
                {client.serviceDetails ||
                  "No additional service details provided."}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            WORK PROGRESS
        ================================================= */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3">
              <CheckCircle2
                size={24}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Work Progress
              </h2>

              <p className="text-sm text-slate-500">
                Follow the progress of your work
              </p>
            </div>
          </div>

          <div className="mt-10">

            {/* Desktop progress */}
            <div className="hidden md:block">
              <div className="relative">

                <div className="absolute left-[12.5%] right-[12.5%] top-6 h-1 rounded-full bg-slate-200" />

                <div
                  className="absolute left-[12.5%] top-6 h-1 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width:
                      currentStep <= 0
                        ? "0%"
                        : `${(currentStep / 3) * 75}%`,
                  }}
                />

                <div className="relative grid grid-cols-4">

                  {statusSteps.map((step, index) => {
                    const completed =
                      index <= currentStep;

                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-md ${
                            completed
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {completed ? (
                            <Check size={22} />
                          ) : (
                            <Clock size={20} />
                          )}
                        </div>

                        <p
                          className={`mt-3 text-sm font-semibold ${
                            completed
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          {step}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile progress */}
            <div className="space-y-4 md:hidden">
              {statusSteps.map((step, index) => {
                const completed =
                  index <= currentStep;

                return (
                  <div
                    key={step}
                    className="flex items-center gap-4"
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                        completed
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {completed ? (
                        <Check size={20} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>

                    <div>
                      <p
                        className={`font-semibold ${
                          completed
                            ? "text-emerald-600"
                            : "text-slate-400"
                        }`}
                      >
                        {step}
                      </p>

                      {index === currentStep && (
                        <p className="text-xs text-slate-500">
                          Current stage
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            PAYMENT
        ================================================= */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-3">
                <CreditCard
                  size={24}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Payment Summary
                </h2>

                <p className="text-sm text-slate-500">
                  Your current payment information
                </p>
              </div>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                client.paymentStatus === "Paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : client.paymentStatus === "Part Payment"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {client.paymentStatus}
            </div>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-2">

            {/* Breakdown */}
            <div className="rounded-2xl bg-slate-50 p-6">

              <div className="flex justify-between py-3">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold">
                  GH₵ {subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-200 py-3">
                <span className="text-slate-500">
                  Discount
                </span>

                <span className="font-semibold text-red-600">
                  - GH₵ {discount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-4">
                <span className="font-bold">
                  Total
                </span>

                <span className="text-xl font-bold">
                  GH₵ {total.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 py-3">
                <span className="text-slate-500">
                  Amount Paid
                </span>

                <span className="font-semibold text-emerald-600">
                  GH₵ {amountPaid.toFixed(2)}
                </span>
              </div>

              <div className="mt-3 flex justify-between rounded-xl bg-red-50 p-4">
                <span className="font-bold text-red-700">
                  Balance
                </span>

                <span className="text-lg font-bold text-red-700">
                  GH₵ {balance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment CTA */}
            <div className="flex flex-col justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <CreditCard size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Make a Payment
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                You can pay your outstanding balance securely
                online through your customer portal.
              </p>

                {balance > 0 ? (
                <button
                    onClick={async () => {
                    try {
                        const reference = `CKT-${Date.now()}`;

                        const response = await fetch("/api/payments/initialize", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                        email:
                            client.email ||
                            `${client.phone.replace(/\D/g, "")}@costakudustech.com`,
                        amount: balance,
                        reference,
                        callback_url: window.location.href,
                        portalToken: token,
                        }),
                        });

                        const data = await response.json();

                        if (!response.ok || !data.authorization_url) {
                        alert(data.error || "Unable to initialize payment.");
                        return;
                        }

                        window.location.href = data.authorization_url;
                    } catch (error) {
                        console.error("Payment error:", error);
                        alert("Unable to start payment. Please try again.");
                    }
                    }}
                    className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 font-bold text-blue-700 shadow-lg transition hover:bg-blue-50"
                >
                    Pay GH₵ {balance.toFixed(2)}
                    <ArrowRight size={18} />
                </button>
                ) : (
                <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 font-bold">
                    <CheckCircle2 size={20} />
                    Fully Paid
                </div>
                )}

              <p className="mt-3 text-center text-xs text-blue-200">
                Secure online payment coming soon
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            ACTIONS
        ================================================= */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="text-sm text-slate-500">
              Manage your services and documents
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Link
            href={`/customer/${token}/invoice`}
            className="group rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
            <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-100 p-3">
                <FileText
                    size={23}
                    className="text-blue-600"
                />
                </div>

                <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1"
                />
            </div>

            <h3 className="mt-5 font-bold text-slate-900">
                View Invoice
            </h3>

            <p className="mt-1 text-sm text-slate-500">
                View your latest invoice
            </p>

            <span className="mt-3 inline-block text-xs font-semibold text-blue-600">
                View Invoice →
            </span>
            </Link>
            <Link
              href={`/customer/${token}/receipt`}
              className="group rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-emerald-100 p-3">
                  <Receipt size={23} className="text-emerald-600" />
                </div>
                <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-5 font-bold text-slate-900">View Receipts</h3>
              <p className="mt-1 text-sm text-slate-500">Access your payment receipts</p>
              <span className="mt-3 inline-block text-xs font-semibold text-emerald-600">View Receipts →</span>
            </Link>

            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="group rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-purple-100 p-3">
                  <Briefcase size={23} className="text-purple-600" />
                </div>
                <ArrowRight size={18} className="text-slate-300 transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-5 font-bold text-slate-900">Order New Job</h3>
              <p className="mt-1 text-sm text-slate-500">Request another service</p>
              <span className="mt-3 inline-block text-xs font-semibold text-purple-600">Order Now →</span>
            </button>
          </div>
        </section>

        {/* =================================================
            ORDER NEW JOB MODAL
        ================================================= */}
        {orderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 p-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Order New Job</h2>
                  <p className="mt-1 text-sm text-slate-500">Request another service from Costa Kudus Tech.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderOpen(false)}
                  className="rounded-xl p-2 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Service *</label>
                  <select
                    value={orderService}
                    onChange={(e) => setOrderService(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((service) => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Job Details</label>
                  <textarea
                    value={orderDetails}
                    onChange={(e) => setOrderDetails(e.target.value)}
                    rows={5}
                    placeholder="Tell us what you need..."
                    className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="rounded-xl bg-purple-50 p-4 text-sm text-purple-800">
                  Your request will be submitted as a new job request. Costa Kudus Tech will review it and confirm the price before work begins.
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingOrder}
                    onClick={submitNewJob}
                    className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingOrder ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            CUSTOMER CONTACT
        ================================================= */}
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-xl sm:p-8">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="text-sm text-slate-400">
                Need assistance?
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Contact Costa Kudus Tech
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Our team is ready to assist you with your job.
              </p>
            </div>

            <a
            href={`https://wa.me/233540503966?text=${encodeURIComponent(
                `Hello Costa Kudus Tech, I am ${client.fullName}. I am contacting you regarding my ${client.service} job.\n\nCurrent Job Status: ${status}\nPayment Status: ${client.paymentStatus}\nTotal Amount: GH₵ ${total.toFixed(2)}\nAmount Paid: GH₵ ${amountPaid.toFixed(2)}\nOutstanding Balance: GH₵ ${balance.toFixed(2)}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700"
            >
            <Phone size={18} />
            Contact Us on WhatsApp
            </a>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}
        <footer className="border-t border-slate-200 py-8 text-center">

          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="Costa Kudus Tech"
              className="h-14 w-14 object-contain"
            />
          </div>

          <p className="mt-3 font-semibold text-slate-800">
            Costa Kudus Tech
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Technology • Digital Services • Business Solutions
          </p>

          <p className="mt-4 text-xs text-slate-400">
            © {new Date().getFullYear()} Costa Kudus Tech. All
            rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}