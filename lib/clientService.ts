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
import { Client } from "./types";

const COLLECTION = "clients";

// Add Client
export const addClient = async (
  client: Omit<Client, "id" | "createdAt">
) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...client,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get All Clients
export const getClients = async (): Promise<Client[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<Client, "id">),
  }));
};

// Update Client
export const updateClient = async (
  id: string,
  client: Partial<Client>
) => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, client);
};

// Delete Client
export const deleteClient = async (id: string) => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};