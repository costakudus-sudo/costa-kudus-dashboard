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

/*
 * Generate a simple customer-facing Job ID.
 *
 * Examples:
 * JOB-0001
 * JOB-0002
 * JOB-0003
 */
const generateJobNumber = async (): Promise<string> => {
  const snapshot = await getDocs(collection(db, COLLECTION));

  let highestNumber = 0;

  snapshot.docs.forEach((docItem) => {
    const data = docItem.data();

    if (data.jobNumber) {
      const match = String(data.jobNumber).match(/^JOB-(\d+)$/);

      if (match) {
        const number = Number(match[1]);

        if (number > highestNumber) {
          highestNumber = number;
        }
      }
    }
  });

  const nextNumber = highestNumber + 1;

  return `JOB-${String(nextNumber).padStart(4, "0")}`;
};

/*
 * Add Job
 */
export const addJob = async (
  job: Omit<Job, "id" | "createdAt">
) => {
  // Generate a simple Job ID before saving
  const jobNumber = await generateJobNumber();

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...job,

    // Customer-facing Job ID
    jobNumber,

    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    jobNumber,
  };
};

/*
 * Get Jobs
 */
export const getJobs = async (): Promise<Job[]> => {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs.map((docItem) => {
    const data = docItem.data() as Omit<Job, "id">;

    return {
      id: docItem.id,
      ...data,

      // Keep jobNumber if it exists.
      // Older jobs without jobNumber will temporarily
      // use their Firebase ID as the fallback.
      jobNumber: data.jobNumber || docItem.id,
    } as Job;
  });
};

/*
 * Update Job
 */
export const updateJob = async (
  id: string,
  job: Partial<Job>
) => {
  const ref = doc(db, COLLECTION, id);

  await updateDoc(ref, job);
};

/*
 * Delete Job
 */
export const deleteJob = async (id: string) => {
  const ref = doc(db, COLLECTION, id);

  await deleteDoc(ref);
};