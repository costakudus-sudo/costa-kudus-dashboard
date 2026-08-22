"use client";

interface PaymentFieldsProps {
  paymentStatus: string;
  setPaymentStatus: (value: string) => void;
}

export default function PaymentFields({
  paymentStatus,
  setPaymentStatus,
}: PaymentFieldsProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Payment Status
      </label>

      <select
        value={paymentStatus}
        onChange={(e) => setPaymentStatus(e.target.value)}
        className="w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        <option value="">Select Payment Status</option>
        <option value="Unpaid">Unpaid</option>
        <option value="Part Payment">Part Payment</option>
        <option value="Paid">Paid</option>
      </select>
    </div>
  );
}