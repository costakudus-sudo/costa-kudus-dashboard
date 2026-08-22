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
import { Job } from "./jobTypes";

const COLLECTION = "jobs";

// Add Job
export const addJob = async (
  job: Omit<Job, "id" | "createdAt">
) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...job,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get Jobs
export const getJobs = async (): Promise<Job[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...(docItem.data() as Omit<Job, "id">),
  }));
};

// Update Job
export const updateJob = async (
  id: string,
  job: Partial<Job>
) => {
  const ref = doc(db, COLLECTION, id);

  await updateDoc(ref, job);
};

// Delete Job
export const deleteJob = async (id: string) => {
  const ref = doc(db, COLLECTION, id);

  await deleteDoc(ref);
};