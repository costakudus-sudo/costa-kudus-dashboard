"use client";

import { useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function TrackPage() {

  const [trackingId, setTrackingId] = useState("");

  const [task, setTask] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {

    setLoading(true);

    const snapshot = await getDocs(
      collection(db, "tasks")
    );

    const foundTask = snapshot.docs.find(
      (doc) =>
        doc.data().trackingId === trackingId
    );

    if (foundTask) {
      setTask(foundTask.data());
    } else {
      setTask(null);
      alert("Task not found");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">

        <h1 className="text-4xl font-bold mb-6">
          Track Your Task
        </h1>

        <div className="flex gap-4 mb-6">

          <input
            type="text"
            placeholder="Enter Tracking ID"
            value={trackingId}
            onChange={(e) =>
              setTrackingId(e.target.value)
            }
            className="flex-1 border p-4 rounded-xl"
          />

          <button
            onClick={handleTrack}
            className="bg-blue-600 text-white px-6 rounded-xl"
          >
            {loading ? "Searching..." : "Track"}
          </button>

        </div>

        {task && (

          <div className="border rounded-2xl p-6">

            <h2 className="text-2xl font-bold mb-4">
              {task.taskName}
            </h2>

            <p className="mb-2">
              Client:
              <span className="font-semibold">
                {" "} {task.clientName}
              </span>
            </p>

            <p className="mb-2">
              Status:
              <span className="font-semibold text-blue-600">
                {" "} {task.status}
              </span>
            </p>

            <p className="mb-2">
              Tracking ID:
              <span className="font-semibold">
                {" "} {task.trackingId}
              </span>
            </p>

          </div>

        )}

      </div>

    </main>
  );
}