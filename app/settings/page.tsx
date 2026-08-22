"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Save,
  CheckCircle,
  Upload,
  Trash2,
} from "lucide-react";

import {
  CompanySettings,
  defaultSettings,
  getCompanySettings,
  saveCompanySettings,
} from "../../lib/settingsService";

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<CompanySettings>(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ============================
  // LOAD SETTINGS
  // ============================

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getCompanySettings();

        setSettings(data);
      } catch (error) {
        console.error(
          "Error loading settings:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ============================
  // HANDLE INPUT CHANGE
  // ============================

  const handleChange = (
    field: keyof CompanySettings,
    value: string
  ) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaved(false);
  };

  // ============================
  // LOGO UPLOAD
  // ============================

  const handleLogoUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Maximum 700 KB
    if (file.size > 700 * 1024) {
      alert(
        "Please choose a logo smaller than 700 KB."
      );

      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setSettings((previous) => ({
          ...previous,
          logo: result,
        }));

        setSaved(false);
      }
    };

    reader.onerror = () => {
      alert("Failed to read the logo file.");
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  // ============================
  // REMOVE LOGO
  // ============================

  const handleRemoveLogo = () => {
    setSettings((previous) => ({
      ...previous,
      logo: "",
    }));

    setSaved(false);
  };

  // ============================
  // SAVE SETTINGS
  // ============================

  const handleSave = async () => {
    try {
      setSaving(true);

      await saveCompanySettings(settings);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Error saving settings:",
        error
      );

      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // LOADING
  // ============================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Settings
        </h1>

        <p className="mt-1 text-slate-500">
          Manage your Costa Kudus Tech business information.
        </p>
      </div>

      {/* SUCCESS MESSAGE */}

      {saved && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">

          <CheckCircle size={22} />

          <span className="font-medium">
            Settings saved successfully.
          </span>

        </div>
      )}

      {/* COMPANY INFORMATION */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-blue-100 p-3">
            <Building2
              className="text-blue-600"
              size={24}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Company Information
            </h2>

            <p className="text-sm text-slate-500">
              Basic information about your business.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* COMPANY NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Company Name
            </label>

            <input
              type="text"
              value={settings.companyName}
              onChange={(e) =>
                handleChange(
                  "companyName",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TAGLINE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tagline
            </label>

            <input
              type="text"
              value={settings.tagline}
              onChange={(e) =>
                handleChange(
                  "tagline",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

      </div>

      {/* CONTACT INFORMATION */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-green-100 p-3">
            <Phone
              className="text-green-600"
              size={24}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Contact Information
            </h2>

            <p className="text-sm text-slate-500">
              Your business contact details.
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          {/* PHONE */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Phone size={16} />
              Phone
            </label>

            <input
              type="text"
              value={settings.phone}
              onChange={(e) =>
                handleChange(
                  "phone",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* WHATSAPP */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              WhatsApp
            </label>

            <input
              type="text"
              value={settings.whatsapp}
              onChange={(e) =>
                handleChange(
                  "whatsapp",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Mail size={16} />
              Email
            </label>

            <input
              type="email"
              value={settings.email}
              onChange={(e) =>
                handleChange(
                  "email",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* WEBSITE */}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Globe size={16} />
              Website
            </label>

            <input
              type="text"
              value={settings.website}
              onChange={(e) =>
                handleChange(
                  "website",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ADDRESS */}

          <div className="md:col-span-2">

            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <MapPin size={16} />
              Address
            </label>

            <input
              type="text"
              value={settings.address}
              onChange={(e) =>
                handleChange(
                  "address",
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>

      </div>

      {/* SOCIAL MEDIA */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-purple-100 p-3">
            <Globe
              className="text-purple-600"
              size={24}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Social Media
            </h2>

            <p className="text-sm text-slate-500">
              Add your social media links.
            </p>
          </div>

        </div>

        <div>

          <label className="mb-2 block text-sm font-medium text-slate-700">
            TikTok / Facebook / Instagram
          </label>

          <input
            type="text"
            value={settings.socialMedia}
            onChange={(e) =>
              handleChange(
                "socialMedia",
                e.target.value
              )
            }
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />

        </div>

      </div>

      {/* COMPANY LOGO */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-orange-100 p-3">
            <Building2
              className="text-orange-600"
              size={24}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Company Logo
            </h2>

            <p className="text-sm text-slate-500">
              Upload the logo that will appear on your invoices.
            </p>
          </div>

        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">

          {/* LOGO PREVIEW */}

          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">

            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Company Logo"
                className="h-full w-full object-contain p-3"
              />
            ) : (
              <div className="text-center text-sm text-slate-400">
                No Logo
              </div>
            )}

          </div>

          {/* UPLOAD CONTROLS */}

          <div className="space-y-3">

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">

              <Upload size={19} />

              Upload Logo

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />

            </label>

            {settings.logo && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="ml-2 inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={18} />
                Remove Logo
              </button>
            )}

            <p className="text-sm text-slate-500">
              PNG, JPG or WebP. Maximum size: 700 KB.
            </p>

            <p className="text-xs text-slate-400">
              The logo will be used automatically on your invoices.
            </p>

          </div>

        </div>

      </div>

      {/* SAVE BUTTON */}

      <div className="flex justify-end pb-8">

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <Save size={20} />

          {saving
            ? "Saving..."
            : "Save Settings"}

        </button>

      </div>

    </div>
  );
}