import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import { Invoice } from "./invoiceTypes";

const COLLECTION = "invoices";

// Add Invoice
export const addInvoice = async (
  invoice: Omit<Invoice, "id" | "createdAt">
) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...invoice,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get Invoices
export const getInvoices = async (): Promise<Invoice[]> => {
  const snapshot = await getDocs(
    collection(db, COLLECTION)
  );

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<Invoice, "id">),
  }));
};

// Update Invoice
export const updateInvoice = async (
  id: string,
  invoice: Partial<Invoice>
) => {
  const ref = doc(db, COLLECTION, id);

  await updateDoc(ref, invoice);
};

// Delete Invoice
export const deleteInvoice = async (id: string) => {
  const ref = doc(db, COLLECTION, id);

  await deleteDoc(ref);
};