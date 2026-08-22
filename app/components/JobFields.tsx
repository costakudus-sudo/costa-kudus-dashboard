"use client";

interface JobFieldsProps {
  amount: string;
  setAmount: (value: string) => void;
  jobStatus: string;
  setJobStatus: (value: string) => void;
  serviceDetails: string;
  setServiceDetails: (value: string) => void;
}

export default function JobFields({
  amount,
  setAmount,
  jobStatus,
  setJobStatus,
  serviceDetails,
  setServiceDetails,
}: JobFieldsProps) {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Amount (GH₵)
        </label>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Job Status
        </label>

        <select
          value={jobStatus}
          onChange={(e) => setJobStatus(e.target.value)}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        >
          <option value="">Select Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Service Details
        </label>

        <textarea
          rows={5}
          value={serviceDetails}
          onChange={(e) => setServiceDetails(e.target.value)}
          placeholder="Describe the work to be done..."
          className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>
    </>
  );
}