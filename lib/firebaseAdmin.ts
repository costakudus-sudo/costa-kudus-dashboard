import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!projectId) {
    throw new Error("FIREBASE_ADMIN_PROJECT_ID is missing.");
  }

  if (!clientEmail) {
    throw new Error("FIREBASE_ADMIN_CLIENT_EMAIL is missing.");
  }

  if (!privateKey) {
    throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is missing.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdminDb() {
  return getFirestore(getFirebaseAdminApp());
}

/*
 * Keep this export because the existing payment API routes
 * already import adminDb.
 */
export const adminDb = getAdminDb();

export default getFirebaseAdminApp;