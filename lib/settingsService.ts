import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export interface CompanySettings {
  companyName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  website: string;
  socialMedia: string;
  logo: string;
}

const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOCUMENT = "company";

export const defaultSettings: CompanySettings = {
  companyName: "Costa Kudus Tech",
  tagline: "Costa Kudus Tech",
  phone: "0540503966 / 0241810068",
  whatsapp: "0540503966",
  email: "costakudus@gmail.com",
  address: "Wa, Upper West Region - Ghana",
  website: "costakudustech.com",
  socialMedia:
    "https://www.tiktok.com/@costakudustech",
  logo: "/logo.png",
};

// Get company settings
export const getCompanySettings =
  async (): Promise<CompanySettings> => {
    const ref = doc(
      db,
      SETTINGS_COLLECTION,
      SETTINGS_DOCUMENT
    );

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...(snapshot.data() as Partial<CompanySettings>),
    };
  };

// Save company settings
export const saveCompanySettings =
  async (
    settings: CompanySettings
  ) => {
    const ref = doc(
      db,
      SETTINGS_COLLECTION,
      SETTINGS_DOCUMENT
    );

    await setDoc(ref, settings, {
      merge: true,
    });
  };