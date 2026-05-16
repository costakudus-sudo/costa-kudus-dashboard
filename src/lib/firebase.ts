import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8cmZqxS9SUNRIZYdeyfcPX3jZmtVKxdY",
  authDomain: "costa-kudus-tech.firebaseapp.com",
  projectId: "costa-kudus-tech",
  storageBucket: "costa-kudus-tech.appspot.com",
  messagingSenderId: "191705232582",
  appId: "1:191705232582:web:af08e50eaae2fb265293c7",
  measurementId: "G-548MC1HXM5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);