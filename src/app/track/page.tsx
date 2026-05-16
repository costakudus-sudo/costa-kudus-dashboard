"use client";

import { useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface Task {
  id: string;
  title: string;
  client: string;
  status: string;
  deadline: string;
  trackingId: string;
}

export default function TrackPage() {

  const [trackingId, setTrackingId] = useState("");
  const [task, setTask] = useState<Task | null>(null);

  const handleTrackTask = async () => {

    if (!trackingId) {
      alert("Please enter tracking ID");
      return;
    }

    try {

      const querySnapshot = await getDocs(
        collection(db, "tasks")
      );

      const tasks: Task[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Task, "id">),
      }));

      const foundTask = tasks.find(
        (t) =>
          t.trackingId.toLowerCase() ===
          trackingId.toLowerCase()
      );

      if (foundTask) {
        setTask(foundTask);
      } else {
        alert("Task not found");
        setTask(null);
      }

    } catch (error) {
      console.error(error);
      alert("Error tracking task");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-3xl mx-auto">

        {/* Tracking Form */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">

          <h1 className="text-3xl font-bold mb-6 text-center">
            Track Your Task
          </h1>

          <div className="flex gap-4">

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
              onClick={handleTrackTask}
              className="bg-blue-700 text-white px-6 rounded-xl hover:bg-blue-800"
            >
              Track
            </button>

          </div>

        </div>

        {/* Task Result */}
        {task && (

          <div className="bg-white rounded-2xl shadow-md p-8">

            <h2 className="text-2xl font-bold mb-6">
              Task Details
            </h2>

            <div className="space-y-4">

              <div>
                <span className="font-semibold">
                  Task:
                </span>{" "}
                {task.title}
              </div>

              <div>
                <span className="font-semibold">
                  Client:
                </span>{" "}
                {task.client}
              </div>

              <div>
                <span className="font-semibold">
                  Deadline:
                </span>{" "}
                {task.deadline}
              </div>

              <div>
                <span className="font-semibold">
                  Tracking ID:
                </span>{" "}
                {task.trackingId}
              </div>

              <div className="mt-6">

                <span className="font-semibold">
                  Status:
                </span>

                <div className="mt-2 bg-yellow-100 text-yellow-800 px-5 py-3 rounded-xl inline-block">
                  {task.status}
                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}