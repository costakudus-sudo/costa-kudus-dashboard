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
  XCircle,
  X,
} from "lucide-react";

import {
  getJobs,
  addJob,
  updateJob,
  deleteJob,
} from "../../lib/jobService";

import { getClients } from "../../lib/clientService";

interface Client {
  id: string;
  name?: string;
  fullName?: string;
  phone?: string;
}

interface Job {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
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

  startDate?: string;
  endDate?: string;
  scheduledDate?: string;
  createdAt?: Date;
}

const emptyForm = {
  clientId: "",
  clientName: "",
  phone: "",
  service: "",
  serviceDetails: "",
  amount: "",
  discount: "",
  total: "",
  amountPaid: "",
  balance: "",
  jobStatus: "Pending",
  paymentStatus: "Unpaid",
  startDate: "",
  endDate: "",
  scheduledDate: "",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const [search, setSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  const [form, setForm] = useState(emptyForm);

  /*
   * LOAD JOBS AND CLIENTS
   */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, clientsData] = await Promise.all([
        getJobs(),
        getClients(),
      ]);

      setJobs(jobsData);

      const normalizedClients = clientsData.map((client: any) => ({
        ...client,
        name: client.name || client.fullName || "",
      }));

      setClients(normalizedClients);
    } catch (error) {
      console.error("Error loading jobs:", error);
    }
  };

  /*
   * HANDLE INPUT
   */
  const handleChange = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * SELECT CLIENT
   */
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

  /*
   * OPEN ADD FORM
   */
  const openAddForm = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setOpenForm(true);
  };

  /*
   * OPEN EDIT FORM
   */
  const openEditForm = (job: Job) => {
    setEditingJob(job);

setForm({
  clientId: job.clientId || "",
  clientName: job.clientName || "",
  phone: job.phone || "",
  service: job.service || "",
  serviceDetails: job.serviceDetails || "",
  amount: job.amount?.toString() || "",
  discount: job.discount?.toString() || "",
  total: job.total?.toString() || "",
  amountPaid: job.amountPaid?.toString() || "",
  balance: job.balance?.toString() || "",
  jobStatus: job.jobStatus || "Pending",
  paymentStatus: job.paymentStatus || "Unpaid",
  startDate: job.startDate || "",
  endDate: job.endDate || "",
  scheduledDate: job.scheduledDate || "",
});

    setOpenForm(true);
  };

  /*
   * SAVE JOB
   */
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
        jobStatus: form.jobStatus as Job["jobStatus"],
        paymentStatus:
            form.paymentStatus as Job["paymentStatus"],
        scheduledDate: form.scheduledDate,
        };

      if (editingJob) {
        await updateJob(editingJob.id, jobData);

        alert("Job updated successfully.");
      } else {
        await addJob(jobData);

        alert("Job added successfully.");
      }

      setOpenForm(false);
      setEditingJob(null);
      setForm(emptyForm);

      await loadData();
    } catch (error) {
      console.error("Error saving job:", error);

      alert("Failed to save job.");
    }
  };

  /*
   * DELETE JOB
   */
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
   * SEARCH
   */
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
        .includes(searchText)
    );
  });

  /*
   * STATUS COLORS
   */
  const statusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /*
   * PAYMENT COLORS
   */
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

  /*
   * STATISTICS
   */
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

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-center justify-between">

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
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
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

      {/* JOB TABLE */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr className="text-left">

                <th className="p-4">
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

                <th className="text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredJobs.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
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

                    <td className="p-4">

                      <p className="font-semibold text-slate-800">
                        {job.clientName}
                      </p>

                      <p className="text-sm text-slate-500">
                        {job.phone}
                      </p>

                    </td>

                    <td>
                      {job.service}
                    </td>

                    <td className="font-semibold">
                      GH₵ {Number(job.amount).toFixed(2)}
                    </td>

                    <td>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor(
                          job.jobStatus
                        )}`}
                      >
                        {job.jobStatus}
                      </span>

                    </td>

                    <td>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${paymentColor(
                          job.paymentStatus
                        )}`}
                      >
                        {job.paymentStatus}
                      </span>

                    </td>

                    <td>

                      <div className="flex justify-center gap-3">

                        {/* VIEW */}

                        <button
                          onClick={() =>
                            setViewingJob(job)
                          }
                          className="text-blue-600 hover:text-blue-800"
                          title="View Job"
                        >
                          <Eye size={18} />
                        </button>

                        {/* EDIT */}

                        <button
                          onClick={() =>
                            openEditForm(job)
                          }
                          className="text-green-600 hover:text-green-800"
                          title="Edit Job"
                        >
                          <Pencil size={18} />
                        </button>

                        {/* DELETE */}

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

      {/* ADD / EDIT JOB MODAL */}

      {openForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">

          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

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
                }}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X />
              </button>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">

              {/* CLIENT */}

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

              {/* PHONE */}

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

              {/* SERVICE */}

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Service *
                </label>

                <input
                  value={form.service}
                  onChange={(e) =>
                    handleChange(
                      "service",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Printing"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* AMOUNT */}

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

              {/* JOB STATUS */}

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

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

              {/* PAYMENT STATUS */}

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

              {/* DETAILS */}

              <div className="md:col-span-2 space-y-5">
                            <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                Scheduled Date
            </label>

            <input
                type="date"
                value={form.scheduledDate}
                onChange={(e) =>
                setForm({
                    ...form,
                    scheduledDate: e.target.value,
                })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            </div>
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

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t p-6">

              <button
                onClick={() => {
                  setOpenForm(false);
                  setEditingJob(null);
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

      {/* VIEW JOB MODAL */}

      {viewingJob && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-6">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Job Details
                </h2>

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
                    viewingJob.amount
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

              <div className="md:col-span-2">

                <p className="text-sm text-slate-500">
                  Job Details
                </p>

                <p className="font-semibold">
                  {viewingJob.serviceDetails ||
                    "No details provided."}
                </p>

              </div>

            </div>

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