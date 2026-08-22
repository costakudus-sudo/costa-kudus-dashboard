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
import { Payment } from "./paymentTypes";

const COLLECTION = "payments";

// Add Payment
export const addPayment = async (
  payment: Omit<Payment, "id" | "createdAt">
) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...payment,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get Payments
export const getPayments = async (): Promise<Payment[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<Payment, "id">),
  }));
};

// Update Payment
export const updatePayment = async (
  id: string,
  payment: Partial<Payment>
) => {
  const ref = doc(db, COLLECTION, id);

  await updateDoc(ref, payment);
};

// Delete Payment
export const deletePayment = async (id: string) => {
  const ref = doc(db, COLLECTION, id);

  await deleteDoc(ref);
};