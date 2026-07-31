"use client";

import { X } from "lucide-react";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
}

export default function ClientForm({
  open,
  onClose,
}: ClientFormProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Add Client
            </h2>

            <p className="text-sm text-slate-500">
              Costa Kudus Tech Business Management System
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>

        </div>

        {/* Form */}

        <form className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter client name"
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone Number
            </label>

            <input
              type="text"
              placeholder="024xxxxxxx"
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              placeholder="client@email.com"
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Service
            </label>

<select>

  <optgroup label="🖨 Printing Services">
    <option>Printing</option>
    <option>Bulk Printing</option>
    <option>Photocopying</option>
    <option>Scanning</option>
    <option>Lamination</option>
    <option>Book Binding</option>
    <option>Spiral Binding</option>
    <option>Hard Cover Binding</option>
  </optgroup>

  <optgroup label="📸 Photo Services">
    <option>Passport Photo</option>
    <option>Photo Frame</option>
    <option>Photo Editing</option>
    <option>Photo Restoration</option>
  </optgroup>

  <optgroup label="🎨 Graphic Design">
    <option>Graphic Design</option>
    <option>Logo Design</option>
    <option>Business Card Design</option>
    <option>Flyer Design</option>
    <option>Poster Design</option>
    <option>Banner Design</option>
    <option>Invitation Card Design</option>
    <option>ID Card Design</option>
    <option>Certificate Design</option>
    <option>Social Media Design</option>
  </optgroup>

  <optgroup label="🎓 Academic Services">
    <option>Project Work</option>
    <option>Research Work</option>
    <option>Proposal Writing</option>
    <option>Thesis/Dissertation</option>
    <option>Assignment Typing</option>
    <option>CV Writing</option>
    <option>Cover Letter Writing</option>
  </optgroup>

  <optgroup label="💻 ICT Services">
    <option>Website Design</option>
    <option>Website Maintenance</option>
    <option>Mobile App Development</option>
    <option>Laptop Repair</option>
    <option>Desktop Repair</option>
    <option>Software Installation</option>
    <option>Phone Setup</option>
    <option>Laptop Setup</option>
  </optgroup>

  <optgroup label="🌐 Online Services">
    <option>Online Registration</option>
    <option>School Admission</option>
    <option>University Application</option>
    <option>Scholarship Application</option>
    <option>Job Application</option>
    <option>Passport Application</option>
    <option>Passport Renewal</option>
    <option>Visa Application</option>
    <option>Ghana Card Registration</option>
    <option>SSNIT Services</option>
    <option>NHIS Registration</option>
    <option>TIN Registration</option>
  </optgroup>

  <optgroup label="📄 Examination Services">
    <option>WAEC Registration</option>
    <option>BECE Results Checker</option>
    <option>WASSCE Results Checker</option>
    <option>NABPTEX Services</option>
  </optgroup>

  <optgroup label="📊 Office Services">
    <option>Typing & Document Formatting</option>
    <option>Document Conversion (PDF/Word)</option>
    <option>Data Entry</option>
    <option>Data Analysis</option>
    <option>Email Setup</option>
    <option>Internet Browsing</option>
  </optgroup>

  <optgroup label="🤖 Other Services">
    <option>Business Consultancy</option>
    <option>ICT Training</option>
    <option>AI Services</option>
    <option>Other</option>
  </optgroup>

</select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Status
            </label>

            <select className="w-full rounded-xl border p-3 outline-none focus:border-blue-500">

              <option>Active</option>
              <option>Pending</option>
              <option>Completed</option>

            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Amount (GH₵)
            </label>

            <input
              type="number"
              placeholder="0.00"
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-medium">
              Address
            </label>

            <textarea
              rows={4}
              placeholder="Client address..."
              className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
            />

          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-6 py-3"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Client
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}