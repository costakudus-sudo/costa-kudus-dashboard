"use client";

interface ClientFieldsProps {
  clientName: string;
  setClientName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
}

export default function ClientFields({
  clientName,
  setClientName,
  phone,
  setPhone,
}: ClientFieldsProps) {
  return (
    <>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Client Name
        </label>

        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Enter client's full name"
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Phone Number
        </label>

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024xxxxxxx"
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>
    </>
  );
}