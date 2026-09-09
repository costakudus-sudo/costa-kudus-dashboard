"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Briefcase,
  Clock,
  CheckCircle,
  X,
  Bell,
  CalendarDays,
  Check,
  RotateCcw,
} from "lucide-react";

import {
  getJobs,
  addJob,
  updateJob,
  deleteJob,
} from "../../lib/jobService";

import {
  getClients,
  updateClient,
  generatePortalToken,
} from "../../lib/clientService";

interface Client {
  id: string;
  name?: string;
  fullName?: string;
  phone?: string;
  portalToken?: string;
  portalEnabled?: boolean;
}

interface Job {
  id: string;
  jobNumber?: string;
  jobId?: string;
  clientId: string;
  clientName: string;
  phone: string;
  email?: string;
  service: string;
  serviceDetails: string;
  amount: number;
  discount?: number;
  total?: number;
  amountPaid?: number;
  balance?: number;

  jobStatus:
    | "Pending"
    | "In Progress"
    | "Completed"
    | "Delivered"
    | "Cancelled";

  paymentStatus:
    | "Unpaid"
    | "Part Payment"
    | "Paid";

  paymentMethod?:
    | "Cash"
    | "Mobile Money"
    | "Bank Transfer"
    | "Card";

  paymentDate?: Date | any;
  scheduledDate?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  source?: string;

  requestStatus?:
    | "New"
    | "Reviewed"
    | "Accepted"
    | "Rejected";

  createdAt?: Date | any;
  updatedAt?: Date | any;
}

const emptyForm = {
  clientId: "",
  clientName: "",
  phone: "",
  service: "",
  serviceDetails: "",
  amount: "",
  jobStatus: "Pending",
  paymentStatus: "Unpaid",
};

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


export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  const [form, setForm] = useState(emptyForm);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [updatingRequest, setUpdatingRequest] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, clientsData] = await Promise.all([
        getJobs(),
        getClients(),
      ]);

      setJobs(jobsData as Job[]);

      const normalizedClients = clientsData.map((client: any) => ({
        ...client,
        name: client.name || client.fullName || "",
      }));

      setClients(normalizedClients);
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(
      (client) => String(client.id) === clientId
    );

    if (!selectedClient) {
      setForm((prev) => ({
        ...prev,
        clientId: "",
        clientName: "",
        phone: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      clientId,
      clientName:
        selectedClient.name ||
        selectedClient.fullName ||
        "",
      phone: selectedClient.phone || "",
    }));
  };

  const openAddForm = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setServiceSearch("");
    setServiceDropdownOpen(false);
    setOpenForm(true);
  };

  const openEditForm = (job: Job) => {
    setEditingJob(job);

    setForm({
      clientId: job.clientId || "",
      clientName: job.clientName || "",
      phone: job.phone || "",
      service: job.service || "",
      serviceDetails: job.serviceDetails || "",
      amount: String(job.amount || ""),
      jobStatus: job.jobStatus || "Pending",
      paymentStatus: job.paymentStatus || "Unpaid",
    });
    setServiceSearch(job.service || "");
    setServiceDropdownOpen(false);

    setOpenForm(true);
  };

  const handleSaveJob = async () => {
    if (
      !form.clientId ||
      !form.service ||
      !form.amount
    ) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      const jobData = {
        clientId: form.clientId,
        clientName: form.clientName,
        phone: form.phone,
        service: form.service,
        serviceDetails: form.serviceDetails,
        amount: Number(form.amount),
        jobStatus:
          form.jobStatus as Job["jobStatus"],
        paymentStatus:
          form.paymentStatus as Job["paymentStatus"],
      };

      if (editingJob) {
        // Update the existing job first.
        await updateJob(editingJob.id, jobData);

        // Use the customer's existing permanent private portal link.
        // If the client does not have one yet, create it once and reuse it.
        try {
          const clients = await getClients();
          const client = clients.find(
            (c: Client) =>
              String(c.id) === String(jobData.clientId)
          );

          let portalToken = client?.portalToken;

          if (!portalToken && client) {
            portalToken = generatePortalToken();

            await updateClient(String(client.id), {
              portalToken,
              portalEnabled: true,
            });
          }

          const baseUrl =
            typeof window !== "undefined"
              ? window.location.origin
              : "";

          const customerPortalLink = portalToken
            ? `${baseUrl}/customer/${encodeURIComponent(portalToken)}`
            : "";

          // Open WhatsApp with the status/payment update pre-filled.
          // This uses the same working wa.me approach as the Clients page.
          if (jobData.phone) {
            const normalizedPhone = jobData.phone
              .replace(/\D/g, "")
              .replace(/^0/, "233");

            const message =
              `Hello ${jobData.clientName || "Customer"}, this is Costa Kudus Tech.\n\n` +
              `There has been an update to your job.\n\n` +
              `Job ID: ${editingJob.jobNumber || editingJob.jobId || editingJob.id}\n` +
              `Service: ${jobData.service}\n` +
              `Current Job Status: ${jobData.jobStatus}\n` +
              `Payment Status: ${jobData.paymentStatus}\n\n` +
              `Open your private customer portal here:\n${customerPortalLink}\n\n` +
              `You can use your portal to track your Work Progress, view your Payment Summary, make online payments, access your Invoice and Receipts, Order a New Job, and Contact Costa Kudus Tech.\n\n` +
              `Please keep this link private. Thank you for choosing Costa Kudus Tech.`;

            const whatsappUrl =
              `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;

            window.open(
              whatsappUrl,
              "_blank",
              "noopener,noreferrer"
            );

            alert(
              "Job updated successfully. WhatsApp has been opened with the update message ready to send."
            );
          } else {
            alert("Job updated successfully.");
          }
        } catch (notificationError) {
          console.error(
            "Job update notification error:",
            notificationError
          );
          // The job update itself succeeded, so don't report the save as failed.
          alert(
            "Job updated successfully, but WhatsApp could not be opened."
          );
        }
      } else {
        // Create a short, customer-friendly Job ID.
        const existingJobs = (await getJobs()) as Job[];

        const numbers = existingJobs
          .map((job: any) => {
            const value = String(
              job.jobNumber || job.jobId || ""
            );
            const match = value.match(/^JOB-(\d+)$/);
            return match ? Number(match[1]) : 0;
          })
          .filter((number) => number > 0);

        const nextNumber =
          numbers.length > 0
            ? Math.max(...numbers) + 1
            : existingJobs.length + 1;

        const jobNumber = `JOB-${String(nextNumber).padStart(4, "0")}`;

        // Store the simple Job ID with the job.
        await addJob({
          ...jobData,
          jobNumber,
        });

        // Build the customer's permanent private portal link.
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : "";

        const clients = await getClients();

        const client = clients.find(
          (c: Client) =>
            String(c.id) === String(jobData.clientId)
        );

        let portalToken = client?.portalToken;

        // Create a portal token only when the client does not already have one.
        // This keeps the same private customer link for future jobs.
        if (!portalToken && client) {
          portalToken = generatePortalToken();

          await updateClient(String(client.id), {
            portalToken,
            portalEnabled: true,
          });
        }

        const customerPortalLink = portalToken
          ? `${baseUrl}/customer/${encodeURIComponent(portalToken)}`
          : "";

        // Notify the client through the working WhatsApp API.
        if (jobData.phone) {
          try {
            const normalizedPhone = jobData.phone
              .replace(/\D/g, "")
              .replace(/^0/, "233");

            const whatsappResponse = await fetch(
              "/api/whatsapp",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  phone: normalizedPhone,
                  message:
                    `Hello ${jobData.clientName || "Customer"}, this is Costa Kudus Tech.\n\n` +
                    `Your job has been created successfully.\n\n` +
                    `Job ID: ${jobNumber}\n` +
                    `Service: ${jobData.service}\n` +
                    `Amount: GH₵ ${jobData.amount.toFixed(2)}\n` +
                    `Status: ${jobData.jobStatus}\n\n` +
                    `Access your customer portal:\n${customerPortalLink}\n\n` +
                    `Please keep your Job ID for future reference. Thank you for choosing Costa Kudus Tech.`,
                }),
              }
            );

            const whatsappData =
              await whatsappResponse.json();

            if (!whatsappResponse.ok || !whatsappData.success) {
              console.error(
                "WhatsApp notification failed:",
                whatsappData
              );
              alert(
                `Job created successfully, but the WhatsApp notification could not be sent.\n\nJob ID: ${jobNumber}`
              );
            } else {
              alert(
                `Job created successfully and the client has been notified on WhatsApp.\n\nJob ID: ${jobNumber}`
              );
            }
          } catch (whatsappError) {
            console.error(
              "WhatsApp notification error:",
              whatsappError
            );
            alert(
              `Job created successfully, but the WhatsApp notification could not be sent.\n\nJob ID: ${jobNumber}`
            );
          }
        } else {
          alert(
            `Job created successfully.\n\nJob ID: ${jobNumber}\n\nNo phone number was available for the WhatsApp notification.`
          );
        }
      }

      setOpenForm(false);
      setEditingJob(null);
      setForm(emptyForm);
      setServiceSearch("");
      setServiceDropdownOpen(false);

      await loadData();
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmed) return;

    try {
      await deleteJob(id);

      setJobs((prev) =>
        prev.filter(
          (job) => String(job.id) !== String(id)
        )
      );

      alert("Job deleted successfully.");
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job.");
    }
  };

  /*
   * CUSTOMER PORTAL REQUEST MANAGEMENT
   */
  const updateRequestStatus = async (
    job: Job,
    requestStatus: NonNullable<Job["requestStatus"]>
  ) => {
    try {
      setUpdatingRequest(job.id);

      const updates: any = {
        requestStatus,
      };

      if (requestStatus === "Accepted") {
        updates.jobStatus = "Pending";
      }

      if (requestStatus === "Rejected") {
        updates.jobStatus = "Cancelled";
      }

      if (requestStatus === "Reviewed") {
        updates.jobStatus = "Pending";
      }

      await updateJob(job.id, updates);

      setJobs((prev) =>
        prev.map((item) =>
          item.id === job.id
            ? {
                ...item,
                ...updates,
              }
            : item
        )
      );

      setViewingJob((current) =>
        current?.id === job.id
          ? {
              ...current,
              ...updates,
            }
          : current
      );
    } catch (error) {
      console.error(
        "Error updating request:",
        error
      );

      alert(
        "Failed to update the customer request."
      );
    } finally {
      setUpdatingRequest(null);
    }
  };

  const filteredServices = SERVICES.filter((service) =>
    service.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    return (
      job.clientName
        ?.toLowerCase()
        .includes(searchText) ||
      job.phone
        ?.toLowerCase()
        .includes(searchText) ||
      job.service
        ?.toLowerCase()
        .includes(searchText) ||
      job.jobStatus
        ?.toLowerCase()
        .includes(searchText) ||
      job.source
        ?.toLowerCase()
        .includes(searchText) ||
      String(job.jobNumber || job.jobId || job.id || "")
        .toLowerCase()
        .includes(searchText) ||
      job.requestStatus
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Delivered":
        return "bg-purple-100 text-purple-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const paymentColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Part Payment":
        return "bg-orange-100 text-orange-700";

      case "Unpaid":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const requestColor = (status?: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-700";

      case "Reviewed":
        return "bg-yellow-100 text-yellow-700";

      case "Accepted":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const totalJobs = jobs.length;

  const pendingJobs = jobs.filter(
    (job) => job.jobStatus === "Pending"
  ).length;

  const inProgressJobs = jobs.filter(
    (job) => job.jobStatus === "In Progress"
  ).length;

  const completedJobs = jobs.filter(
    (job) => job.jobStatus === "Completed"
  ).length;

  const newRequests = jobs.filter(
    (job) =>
      job.source === "Customer Portal" &&
      job.requestStatus === "New"
  ).length;

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Jobs Management
          </h1>

          <p className="mt-1 text-slate-500">
            Track and manage all Costa Kudus Tech jobs.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Job
        </button>

      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <Briefcase size={34} className="mb-3" />

          <p>Total Jobs</p>

          <h2 className="mt-2 text-4xl font-bold">
            {totalJobs}
          </h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white shadow-lg">
          <Clock size={34} className="mb-3" />

          <p>Pending</p>

          <h2 className="mt-2 text-4xl font-bold">
            {pendingJobs}
          </h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 p-6 text-white shadow-lg">
          <Briefcase size={34} className="mb-3" />

          <p>In Progress</p>

          <h2 className="mt-2 text-4xl font-bold">
            {inProgressJobs}
          </h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg">
          <CheckCircle size={34} className="mb-3" />

          <p>Completed</p>

          <h2 className="mt-2 text-4xl font-bold">
            {completedJobs}
          </h2>
        </div>

      </div>

      {/* NEW REQUEST ALERT */}

      {newRequests > 0 && (

        <div className="flex items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Bell size={21} />
          </div>

          <div>
            <p className="font-bold text-blue-900">
              New Customer Requests
            </p>

            <p className="text-sm text-blue-700">
              You have {newRequests} new{" "}
              {newRequests === 1
                ? "job request"
                : "job requests"}{" "}
              from the Customer Portal.
            </p>
          </div>

        </div>

      )}

      {/* SEARCH */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by client, phone, service or status..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr className="text-left">

                <th className="p-4">
                  Job ID
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
                  Job Status
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Request
                </th>

                <th>
                  Source
                </th>

                <th className="text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredJobs.length === 0 ? (

                <tr>

                  <td
                    colSpan={9}
                    className="p-10 text-center text-slate-500"
                  >
                    No jobs found.
                  </td>

                </tr>

              ) : (

                filteredJobs.map((job) => (

                  <tr
                    key={job.id}
                    className="border-t transition hover:bg-slate-50"
                  >

                    {/* JOB ID */}

                    <td className="p-4">
                      <p className="font-semibold text-blue-700">
                        {job.jobNumber || job.jobId || job.id}
                      </p>
                    </td>

                    {/* CLIENT */}

                    <td className="p-4">

                      <p className="font-semibold text-slate-800">
                        {job.clientName}
                      </p>

                      <p className="text-sm text-slate-500">
                        {job.phone}
                      </p>

                    </td>

                    {/* SERVICE */}

                    <td>

                      <p className="font-medium">
                        {job.service}
                      </p>

                      {job.source ===
                        "Customer Portal" &&
                        job.requestStatus ===
                          "New" && (

                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            <Bell size={11} />
                            New Request
                          </span>

                        )}

                    </td>

                    {/* AMOUNT */}

                    <td className="font-semibold">
                      GH₵{" "}
                      {Number(
                        job.total ??
                          job.amount ??
                          0
                      ).toFixed(2)}
                    </td>

                    {/* JOB STATUS */}

                    <td>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor(
                          job.jobStatus
                        )}`}
                      >
                        {job.jobStatus}
                      </span>

                    </td>

                    {/* PAYMENT */}

                    <td>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${paymentColor(
                          job.paymentStatus
                        )}`}
                      >
                        {job.paymentStatus}
                      </span>

                    </td>

                    {/* REQUEST STATUS */}

                    <td>

                      {job.source ===
                      "Customer Portal" ? (

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${requestColor(
                            job.requestStatus
                          )}`}
                        >
                          {job.requestStatus ||
                            "New"}
                        </span>

                      ) : (

                        <span className="text-sm text-slate-400">
                          —
                        </span>

                      )}

                    </td>

                    {/* SOURCE */}

                    <td>

                      {job.source ===
                      "Customer Portal" ? (

                        <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          Customer Portal
                        </span>

                      ) : (

                        <span className="text-sm text-slate-500">
                          Admin
                        </span>

                      )}

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="flex justify-center gap-3">

                        <button
                          onClick={() =>
                            setViewingJob(job)
                          }
                          className="text-blue-600 hover:text-blue-800"
                          title="View Job"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          onClick={() =>
                            openEditForm(job)
                          }
                          className="text-green-600 hover:text-green-800"
                          title="Edit Job"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteJob(job.id)
                          }
                          className="text-red-600 hover:text-red-800"
                          title="Delete Job"
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

      {/* ADD / EDIT MODAL */}

      {openForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-6">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">
                  {editingJob
                    ? "Edit Job"
                    : "Add New Job"}
                </h2>

                <p className="text-sm text-slate-500">
                  Costa Kudus Tech
                </p>

              </div>

              <button
                onClick={() => {
                  setOpenForm(false);
                  setEditingJob(null);
                  setServiceSearch("");
                  setServiceDropdownOpen(false);
                }}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X />
              </button>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Client *
                </label>

                <select
                  value={form.clientId}
                  onChange={(e) =>
                    handleClientChange(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="">
                    Select Client
                  </option>

                  {clients.map((client) => (

                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {client.name ||
                        client.fullName}{" "}
                      — {client.phone}
                    </option>

                  ))}

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone
                </label>

                <input
                  value={form.phone}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                />

              </div>

              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Service *
                </label>

                <input
                  value={serviceSearch || form.service}
                  onFocus={() => {
                    setServiceDropdownOpen(true);
                    setServiceSearch(form.service);
                  }}
                  onChange={(e) => {
                    setServiceSearch(e.target.value);
                    setServiceDropdownOpen(true);
                    handleChange("service", e.target.value);
                  }}
                  placeholder="Search or select a service..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />

                {serviceDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            handleChange("service", service);
                            setServiceSearch(service);
                            setServiceDropdownOpen(false);
                          }}
                          className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-blue-50 hover:text-blue-700 ${
                            form.service === service
                              ? "bg-blue-50 font-semibold text-blue-700"
                              : "text-slate-700"
                          }`}
                        >
                          {service}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-sm text-slate-500">
                        No matching service found.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount (GH₵) *
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) =>
                    handleChange(
                      "amount",
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Job Status
                </label>

                <select
                  value={form.jobStatus}
                  onChange={(e) =>
                    handleChange(
                      "jobStatus",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Delivered">
                    Delivered
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Status
                </label>

                <select
                  value={form.paymentStatus}
                  onChange={(e) =>
                    handleChange(
                      "paymentStatus",
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="Unpaid">
                    Unpaid
                  </option>

                  <option value="Part Payment">
                    Part Payment
                  </option>

                  <option value="Paid">
                    Paid
                  </option>

                </select>

              </div>

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Job Details
                </label>

                <textarea
                  value={form.serviceDetails}
                  onChange={(e) =>
                    handleChange(
                      "serviceDetails",
                      e.target.value
                    )
                  }
                  rows={4}
                  placeholder="Describe the job..."
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t p-6">

              <button
                onClick={() => {
                  setOpenForm(false);
                  setEditingJob(null);
                  setServiceSearch("");
                  setServiceDropdownOpen(false);
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveJob}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                {editingJob
                  ? "Update Job"
                  : "Save Job"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* VIEW JOB / REQUEST MODAL */}

      {viewingJob && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-6">

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-2xl font-bold text-slate-800">
                    Job Details
                  </h2>

                  {viewingJob.source ===
                    "Customer Portal" && (

                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      Customer Portal
                    </span>

                  )}

                </div>

                <p className="text-sm text-slate-500">
                  Costa Kudus Tech
                </p>

              </div>

              <button
                onClick={() =>
                  setViewingJob(null)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X />
              </button>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

              <div>
                <p className="text-sm text-slate-500">
                  Job ID
                </p>

                <p className="font-semibold text-blue-700">
                  {viewingJob.jobNumber ||
                    viewingJob.jobId ||
                    viewingJob.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Client
                </p>

                <p className="font-semibold">
                  {viewingJob.clientName}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Phone
                </p>

                <p className="font-semibold">
                  {viewingJob.phone}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Service
                </p>

                <p className="font-semibold">
                  {viewingJob.service}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Amount
                </p>

                <p className="font-semibold">
                  GH₵{" "}
                  {Number(
                    viewingJob.total ??
                      viewingJob.amount ??
                      0
                  ).toFixed(2)}
                </p>
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Job Status
                </p>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusColor(
                    viewingJob.jobStatus
                  )}`}
                >
                  {viewingJob.jobStatus}
                </span>

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Payment Status
                </p>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${paymentColor(
                    viewingJob.paymentStatus
                  )}`}
                >
                  {viewingJob.paymentStatus}
                </span>

              </div>

              {viewingJob.source ===
                "Customer Portal" && (

                <div>

                  <p className="text-sm text-slate-500">
                    Request Status
                  </p>

                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${requestColor(
                      viewingJob.requestStatus
                    )}`}
                  >
                    {viewingJob.requestStatus ||
                      "New"}
                  </span>

                </div>

              )}

              <div>

                <p className="text-sm text-slate-500">
                  Request Source
                </p>

                <p className="font-semibold">
                  {viewingJob.source ||
                    "Admin"}
                </p>

              </div>

              {viewingJob.scheduledDate && (

                <div className="flex items-start gap-2">

                  <CalendarDays
                    size={18}
                    className="mt-0.5 text-blue-600"
                  />

                  <div>

                    <p className="text-sm text-slate-500">
                      Preferred Date
                    </p>

                    <p className="font-semibold">
                      {viewingJob.scheduledDate}
                    </p>

                  </div>

                </div>

              )}

              <div className="md:col-span-2">

                <p className="text-sm text-slate-500">
                  Job Details
                </p>

                <p className="mt-1 font-semibold">
                  {viewingJob.serviceDetails ||
                    "No details provided."}
                </p>

              </div>

              {viewingJob.notes && (

                <div className="md:col-span-2">

                  <p className="text-sm text-slate-500">
                    Additional Notes
                  </p>

                  <p className="mt-1 font-semibold">
                    {viewingJob.notes}
                  </p>

                </div>

              )}

            </div>

            {/* REQUEST ACTIONS */}

            {viewingJob.source ===
              "Customer Portal" && (

              <div className="border-t bg-slate-50 p-6">

                <p className="mb-4 text-sm font-bold text-slate-700">
                  Request Management
                </p>

                <div className="flex flex-wrap gap-3">

                  {viewingJob.requestStatus ===
                    "New" && (

                    <button
                      disabled={
                        updatingRequest ===
                        viewingJob.id
                      }
                      onClick={() =>
                        updateRequestStatus(
                          viewingJob,
                          "Reviewed"
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
                    >
                      <RotateCcw size={17} />
                      Mark Reviewed
                    </button>

                  )}

                  {viewingJob.requestStatus !==
                    "Accepted" && (
                    <button
                      disabled={
                        updatingRequest ===
                        viewingJob.id
                      }
                      onClick={() =>
                        updateRequestStatus(
                          viewingJob,
                          "Accepted"
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check size={17} />
                      Accept Request
                    </button>
                  )}

                  {viewingJob.requestStatus !==
                    "Rejected" && (
                    <button
                      disabled={
                        updatingRequest ===
                        viewingJob.id
                      }
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            "Reject this customer request?"
                          );

                        if (confirmed) {
                          updateRequestStatus(
                            viewingJob,
                            "Rejected"
                          );
                        }
                      }}
                      className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <X size={17} />
                      Reject Request
                    </button>
                  )}

                </div>

              </div>

            )}

            <div className="flex justify-end border-t p-6">

              <button
                onClick={() =>
                  setViewingJob(null)
                }
                className="rounded-xl bg-slate-800 px-5 py-3 font-medium text-white hover:bg-slate-900"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}