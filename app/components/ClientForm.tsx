"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import ClientFields from "./ClientFields";
import ServiceSelect from "./ServiceSelect";
import JobFields from "./JobFields";
import PaymentFields from "./PaymentFields";

export interface Client {
  id: string | number;
  name: string;
  phone: string;
  service: string;
  serviceDetails: string;
  amount: number;
  jobStatus: string;
  paymentStatus: string;
}

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  editingClient?: Client | null;
}

export default function ClientForm({
  open,
  onClose,
  onSave,
  editingClient,
}: ClientFormProps) {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [serviceDetails, setServiceDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [jobStatus, setJobStatus] = useState("Pending");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  // Load client information when editing
  useEffect(() => {
    if (editingClient) {
      setClientName(editingClient.name || "");
      setPhone(editingClient.phone || "");
      setService(editingClient.service || "");
      setServiceDetails(editingClient.serviceDetails || "");
      setAmount(
        editingClient.amount !== undefined
          ? String(editingClient.amount)
          : ""
      );
      setJobStatus(editingClient.jobStatus || "Pending");
      setPaymentStatus(editingClient.paymentStatus || "Unpaid");
    } else {
      setClientName("");
      setPhone("");
      setService("");
      setServiceDetails("");
      setAmount("");
      setJobStatus("Pending");
      setPaymentStatus("Unpaid");
    }
  }, [editingClient, open]);

  if (!open) return null;

  const saveClient = () => {
    if (!clientName || !phone || !service || !amount) {
      alert("Please fill all required fields.");
      return;
    }

    const client: Client = {
      id: editingClient?.id ?? Date.now(),
      name: clientName,
      phone,
      service,
      serviceDetails,
      amount: Number(amount),
      jobStatus,
      paymentStatus,
    };

    onSave(client);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-2xl font-bold">
              {editingClient ? "Edit Client" : "Add Client"}
            </h2>

            <p className="text-sm text-slate-500">
              Costa Kudus Tech
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X />
          </button>
        </div>

        {/* Form */}
        <div className="grid gap-6 p-6 md:grid-cols-2">

          <div className="space-y-5">
            <ClientFields
              clientName={clientName}
              setClientName={setClientName}
              phone={phone}
              setPhone={setPhone}
            />

            <ServiceSelect
              value={service}
              onChange={setService}
            />
          </div>

          <div className="space-y-5">

            <JobFields
              amount={amount}
              setAmount={setAmount}
              jobStatus={jobStatus}
              setJobStatus={setJobStatus}
              serviceDetails={serviceDetails}
              setServiceDetails={setServiceDetails}
            />

            <PaymentFields
              paymentStatus={paymentStatus}
              setPaymentStatus={setPaymentStatus}
            />

          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t p-6">

          <button
            onClick={onClose}
            className="rounded-xl border px-5 py-3 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={saveClient}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {editingClient ? "Update Client" : "Save Client"}
          </button>

        </div>

      </div>
    </div>
  );
}