"use client";

import { useEffect, useState } from "react";
import ClientForm from "../components/ClientForm";
import { generatePortalToken } from "../../lib/portal";
import { Client } from "../../lib/types";

import {
  getClients,
  addClient,
  updateClient,
  deleteClient,
} from "../../lib/clientService";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  Briefcase,
  Phone,
  X,
  Link,
} from "lucide-react";

export default function ClientsPage() {
  const [openForm, setOpenForm] = useState(false);
  const [search, setSearch] = useState("");

  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);

  const [clients, setClients] = useState<Client[]>([]);

  /*
   * LOAD CLIENTS FROM FIREBASE
   */
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();

        // Normalize the client data so the page/form
        // consistently uses "name".
        const normalizedClients = data.map((client: any) => ({
          ...client,
          name: client.fullName || client.fullName || "",
        }));

        setClients(normalizedClients);
      } catch (error) {
        console.error("Error loading clients:", error);
      }
    };

    loadClients();
  }, []);

  /*
   * ADD / UPDATE CLIENT
   */
  const handleSaveClient = async (client: any) => {
    try {
      if (editingClient) {
        // UPDATE EXISTING CLIENT
        await updateClient(String(client.id), {
        fullName: client.fullName,
        phone: client.phone,
        service: client.service,
        serviceDetails: client.serviceDetails,
        amount: client.amount,
        jobStatus: client.jobStatus,
        paymentStatus: client.paymentStatus,
      });

        alert("Client updated successfully.");
      } else {
        // ADD NEW CLIENT
        await addClient({
          fullName: client.fullName,
          phone: client.phone,
          service: client.service,
          serviceDetails: client.serviceDetails,
          amount: client.amount,
          jobStatus: client.jobStatus,
          paymentStatus: client.paymentStatus,
        });

        alert("Client added successfully.");
      }

      // Reload clients from Firebase
      const updatedClients = await getClients();

      const normalizedClients = updatedClients.map((item: any) => ({
        ...item,
        name: item.name || item.fullName || "",
      }));

      setClients(normalizedClients);

      // Close form
      setOpenForm(false);
      setEditingClient(null);
    } catch (error) {
      console.error("Error saving client:", error);
      alert("Failed to save client.");
    }
  };

  /*
 * GENERATE CUSTOMER PORTAL LINK
 */
const handleGeneratePortalLink = async (client: Client) => {
  try {
    const token =
      client.portalToken || generatePortalToken();

    await updateClient(String(client.id), {
      portalToken: token,
      portalEnabled: true,
    });

    const portalLink = `${window.location.origin}/customer/${token}`;

    await navigator.clipboard.writeText(portalLink);

    alert(
      `Customer portal link created and copied!\n\n${portalLink}`
    );

    // Refresh clients
    const updatedClients = await getClients();

    const normalizedClients = updatedClients.map(
      (item: any) => ({
        ...item,
        name: item.name || item.fullName || "",
      })
    );

    setClients(normalizedClients);
  } catch (error) {
    console.error(
      "Error generating portal link:",
      error
    );

    alert("Failed to generate customer portal link.");
  }
};

  /*
   * DELETE CLIENT
   */
  const handleDeleteClient = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmDelete) return;

    try {
      await deleteClient(id);

      // Remove from screen immediately
      setClients((prev) =>
        prev.filter((client) => String(client.id) !== String(id))
      );

      alert("Client deleted successfully.");
    } catch (error) {
      console.error("Error deleting client:", error);
      alert("Failed to delete client.");
    }
  };

  /*
   * SEARCH
   */
  const filtered = clients.filter((client) => {
    const name = client.fullName || "";
    const phone = client.phone || "";
    const service = client.service || "";

    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      phone.includes(search) ||
      service.toLowerCase().includes(search.toLowerCase())
    );
  });

  /*
   * STATUS COLORS
   */
  const badgeColor = (status: string) => {
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
   * STATISTICS
   */
  const totalClients = clients.length;

  const activeClients = clients.filter(
    (client) =>
      client.jobStatus === "In Progress" ||
      client.jobStatus === "Pending"
  ).length;

  const activeJobs = clients.filter(
    (client) => client.jobStatus === "In Progress"
  ).length;

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Client Management
          </h1>

          <p className="mt-1 text-slate-500">
            Manage all Costa Kudus Tech clients.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingClient(null);
            setOpenForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        {/* Total Clients */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <Users className="mb-3" size={34} />

          <p>Total Clients</p>

          <h2 className="mt-2 text-4xl font-bold">
            {totalClients}
          </h2>
        </div>

        {/* Active Clients */}
        <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg">
          <UserCheck className="mb-3" size={34} />

          <p>Active Clients</p>

          <h2 className="mt-2 text-4xl font-bold">
            {activeClients}
          </h2>
        </div>

        {/* Active Jobs */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <Briefcase className="mb-3" size={34} />

          <p>Active Jobs</p>

          <h2 className="mt-2 text-4xl font-bold">
            {activeJobs}
          </h2>
        </div>

        {/* Today's Calls */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-lg">
          <Phone className="mb-3" size={34} />

          <p>Today's Calls</p>

          <h2 className="mt-2 text-4xl font-bold">
            17
          </h2>
        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="relative">

          <Search
            className="absolute left-4 top-3.5 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search by name, phone or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-100">

              <tr className="text-left">

                <th className="p-4">
                  Client
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Service
                </th>

                <th>
                  Status
                </th>

                <th className="text-center">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.length === 0 ? (

                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-slate-500"
                  >
                    No clients found.
                  </td>
                </tr>

              ) : (

                filtered.map((client) => {

                  const clientName =
                    client.fullName ||
                    "Unnamed Client";

                  const status = client.jobStatus || "Pending";

                  return (
                    <tr
                      key={client.id}
                      className="border-t transition hover:bg-slate-50"
                    >

                      {/* CLIENT */}
                      <td className="p-4 font-semibold">
                        {clientName}
                      </td>

                      {/* PHONE */}
                      <td>
                        {client.phone || "-"}
                      </td>

                      {/* SERVICE */}
                      <td>
                        {client.service || "-"}
                      </td>

                      {/* STATUS */}
                      <td>

                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${badgeColor(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td>

                        <div className="flex justify-center gap-3">
                       {/* CUSTOMER PORTAL */}
                        <button
                          onClick={() =>
                            handleGeneratePortalLink(client)
                          }
                          className="text-purple-600 hover:text-purple-800"
                          title="Generate Customer Portal Link"
                        >
                          <Link size={18} />
                        </button>

                          {/* VIEW */}
                          <button
                            onClick={() =>
                              setViewingClient(client)
                            }
                            className="text-blue-600 hover:text-blue-800"
                            title="View Client"
                          >
                            <Eye size={18} />
                          </button>

                          {/* EDIT */}
                          <button
                            onClick={() => {
                              setEditingClient(client);
                              setOpenForm(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Edit Client"
                          >
                            <Pencil size={18} />
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() =>
                              handleDeleteClient(
                                String(client.id)
                              )
                            }
                            className="text-red-600 hover:text-red-800"
                            title="Delete Client"
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ================= CLIENT FORM ================= */}

      <ClientForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      {/* ================= VIEW CLIENT MODAL ================= */}

      {viewingClient && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-6">

              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Client Details
                </h2>

                <p className="text-sm text-slate-500">
                  Costa Kudus Tech
                </p>
              </div>

              <button
                onClick={() => setViewingClient(null)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={22} />
              </button>

            </div>

            {/* Client Details */}
            <div className="grid gap-5 p-6 md:grid-cols-2">

              <div>
                <p className="text-sm text-slate-500">
                  Full Name
                </p>

                <p className="font-semibold text-slate-800">
                  {viewingClient.fullName ||
                    viewingClient.fullName ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Phone
                </p>

                <p className="font-semibold text-slate-800">
                  {viewingClient.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Service
                </p>

                <p className="font-semibold text-slate-800">
                  {viewingClient.service || "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Amount
                </p>

                <p className="font-semibold text-slate-800">
                  GH₵{" "}
                  {Number(viewingClient.amount || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Job Status
                </p>

                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${badgeColor(
                    viewingClient.jobStatus || "Pending"
                  )}`}
                >
                  viewingClient.jobStatus || "Pending"
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Payment Status
                </p>

                <p className="font-semibold text-slate-800">
                  {viewingClient.paymentStatus || "-"}
                </p>
              </div>

              <div className="md:col-span-2">

                <p className="text-sm text-slate-500">
                  Service Details
                </p>

                <p className="font-semibold text-slate-800">
                  {viewingClient.serviceDetails || "-"}
                </p>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t p-6">

              <button
                onClick={() => setViewingClient(null)}
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