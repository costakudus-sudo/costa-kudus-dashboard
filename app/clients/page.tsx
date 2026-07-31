"use client";

import { useState } from "react";
import ClientForm from "../components/ClientForm";
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
} from "lucide-react";

const clients = [
  {
    id: 1,
    name: "John Mensah",
    phone: "0241234567",
    service: "Printing",
    status: "Active",
  },
  {
    id: 2,
    name: "Amina Sulemana",
    phone: "0559876543",
    service: "Passport Photo",
    status: "Pending",
  },
  {
    id: 3,
    name: "Abdul Rahman",
    phone: "0204567890",
    service: "Graphic Design",
    status: "Completed",
  },
  {
    id: 4,
    name: "Fatima Issah",
    phone: "0541237890",
    service: "Website Design",
    status: "Active",
  },
];

export default function ClientsPage() {
    const [openForm, setOpenForm] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search) ||
      client.service.toLowerCase().includes(search.toLowerCase())
  );

  const badgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Client Management
          </h1>

          <p className="text-slate-500 mt-1">
            Manage all Costa Kudus Tech clients.
          </p>
        </div>

        <button
        onClick={() => setOpenForm(true)}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700"
        >
        <Plus size={18} />
        Add Client
        </button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <Users className="mb-3" size={34} />
          <p>Total Clients</p>
          <h2 className="text-4xl font-bold mt-2">245</h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white shadow-lg">
          <UserCheck className="mb-3" size={34} />
          <p>Active Clients</p>
          <h2 className="text-4xl font-bold mt-2">188</h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-lg">
          <Briefcase className="mb-3" size={34} />
          <p>Active Jobs</p>
          <h2 className="text-4xl font-bold mt-2">62</h2>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white shadow-lg">
          <Phone className="mb-3" size={34} />
          <p>Today's Calls</p>
          <h2 className="text-4xl font-bold mt-2">17</h2>
        </div>

      </div>

      {/* Search */}

      <div className="bg-white rounded-2xl shadow-sm border p-5">

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

      {/* Table */}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

        <table className="w-full">

          <thead className="bg-slate-100">

            <tr className="text-left">

              <th className="p-4">Client</th>
              <th>Phone</th>
              <th>Service</th>
              <th>Status</th>
              <th className="text-center">Actions</th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((client) => (

              <tr
                key={client.id}
                className="border-t hover:bg-slate-50 transition"
              >

                <td className="p-4 font-semibold">{client.name}</td>

                <td>{client.phone}</td>

                <td>{client.service}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor(
                      client.status
                    )}`}
                  >
                    {client.status}
                  </span>

                </td>

                <td>

                  <div className="flex justify-center gap-3">

                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye size={18} />
                    </button>

                    <button className="text-green-600 hover:text-green-800">
                      <Pencil size={18} />
                    </button>

                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
<ClientForm
  open={openForm}
  onClose={() => setOpenForm(false)}
/>
    </div>
  );
}