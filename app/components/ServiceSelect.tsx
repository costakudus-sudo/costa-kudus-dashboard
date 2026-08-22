"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

interface ServiceSelectProps {
  value: string;
  onChange: (value: string) => void;
}

interface ServiceGroup {
  label: string;
  services: string[];
}

const SERVICE_GROUPS: ServiceGroup[] = [
  {
    label: "🖨 Printing Services",
    services: [
      "Printing",
      "Bulk Printing",
      "Photocopying",
      "Scanning",
      "Lamination",
      "Book Binding",
      "Spiral Binding",
      "Hard Cover Binding",
    ],
  },
  {
    label: "📸 Photo Services",
    services: [
      "Passport Photo",
      "Photo Frame",
      "Photo Editing",
      "Photo Restoration",
    ],
  },
  {
    label: "🎨 Graphic Design",
    services: [
      "Graphic Design",
      "Logo Design",
      "Business Card Design",
      "Flyer Design",
      "Poster Design",
      "Banner Design",
      "Invitation Card Design",
      "ID Card Design",
      "Certificate Design",
      "Social Media Design",
    ],
  },
  {
    label: "🎓 Academic Services",
    services: [
      "Project Work",
      "Research Work",
      "Proposal Writing",
      "Thesis / Dissertation",
      "Assignment Typing",
      "CV Writing",
      "Cover Letter Writing",
    ],
  },
  {
    label: "💻 ICT Services",
    services: [
      "Website Design",
      "Website Maintenance",
      "Mobile App Development",
      "Laptop Repair",
      "Desktop Repair",
      "Software Installation",
      "Phone Setup",
      "Laptop Setup",
    ],
  },
  {
    label: "🌐 Online Services",
    services: [
      "Online Registration",
      "School Admission",
      "University Application",
      "Scholarship Application",
      "Job Application",
      "Passport Application",
      "Passport Renewal",
      "Visa Application",
      "Ghana Card Registration",
      "SSNIT Services",
      "NHIS Registration",
      "TIN Registration",
    ],
  },
  {
    label: "📄 Examination Services",
    services: [
      "WAEC Registration",
      "BECE Results Checker",
      "WASSCE Results Checker",
      "NABPTEX Services",
    ],
  },
  {
    label: "📊 Office Services",
    services: [
      "Typing & Document Formatting",
      "Document Conversion (PDF/Word)",
      "Data Entry",
      "Data Analysis",
      "Email Setup",
      "Internet Browsing",
    ],
  },
  {
    label: "🤖 Other Services",
    services: [
      "Business Consultancy",
      "ICT Training",
      "AI Services",
      "Other",
    ],
  },
];

export default function ServiceSelect({
  value,
  onChange,
}: ServiceSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return SERVICE_GROUPS;
    }

    return SERVICE_GROUPS.map((group) => ({
      ...group,
      services: group.services.filter((service) =>
        service.toLowerCase().includes(query)
      ),
    })).filter((group) => group.services.length > 0);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const handleSelect = (service: string) => {
    onChange(service);
    setSearch("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        Type of Service
      </label>

      {/* Selected service button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-left outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        <span
          className={
            value ? "text-slate-800" : "text-slate-400"
          }
        >
          {value || "Select Service"}
        </span>

        <ChevronDown
          size={20}
          className={`text-slate-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          
          {/* Search */}
          <div className="border-b border-slate-200 p-3">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search service..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Service list */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredGroups.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                No service found.
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.label} className="mb-3 last:mb-0">
                  <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    {group.label}
                  </div>

                  <div className="space-y-1">
                    {group.services.map((service) => {
                      const selected = value === service;

                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleSelect(service)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                            selected
                              ? "bg-blue-50 font-semibold text-blue-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{service}</span>

                          {selected && (
                            <Check
                              size={18}
                              className="text-blue-600"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}