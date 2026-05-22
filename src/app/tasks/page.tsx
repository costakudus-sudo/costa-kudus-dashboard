"use client";

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import jsPDF from "jspdf";
interface Task {
  id: string;
  title: string;
  client: string;
  status: string;
  deadline: string;
  trackingId: string;
}

export default function TasksPage() {

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [deadline, setDeadline] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch Tasks
  const fetchTasks = async () => {

    const querySnapshot = await getDocs(
      collection(db, "tasks")
    );

    const taskData: Task[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, "id">),
    }));

    setTasks(taskData);
  };

  useEffect(() => {
    fetchTasks();
  }, []);
// Update Task Status

  // Generate Tracking ID
  const generateTrackingId = () => {
    return "TSK-" + Math.floor(1000 + Math.random() * 9000);
  };

  // Add Task
  const handleAddTask = async () => {

    if (!title || !client) {
      alert("Please fill all required fields");
      return;
    }

    try {

      const trackingId = generateTrackingId();

      await addDoc(collection(db, "tasks"), {
        title,
        client,
        deadline,
        status: "Pending",
        trackingId: "TSK-" + Math.floor(1000 + Math.random() * 9000),
        createdAt: new Date(),
      });

      alert("Task created successfully!");

      setTitle("");
      setClient("");
      setDeadline("");

      fetchTasks();

    } catch (error) {
      console.error(error);
      alert("Error creating task");
    }
  };
const updateTaskStatus = async (
  taskId: string,
  newStatus: string
) => {

  try {

    const taskRef = doc(db, "tasks", taskId);

    await updateDoc(taskRef, {
      status: newStatus,
    });

    fetchTasks();

  } catch (error) {
    console.error(error);
    alert("Error updating task status");
  }
};
const generateInvoice = (task: any) => {

  const doc = new jsPDF();

  doc.setFontSize(22);

  doc.text("COSTA KUDUS TECH", 20, 20);

  doc.setFontSize(16);

  doc.text("Task Invoice", 20, 40);

  doc.setFontSize(12);

  doc.text(`Client: ${task.clientName}`, 20, 60);

  doc.text(`Task: ${task.taskName}`, 20, 70);

  doc.text(`Status: ${task.status}`, 20, 80);

  doc.text(`Tracking ID: ${task.trackingId}`, 20, 90);

  doc.text(`Amount: GH¢ ${task.amount || 0}`, 20, 100);

  doc.text(
    `Generated: ${new Date().toLocaleDateString()}`,
    20,
    120
  );

  doc.save(`${task.trackingId}-invoice.pdf`);
};
  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-6xl mx-auto">

        {/* Task Form */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-10">

          <h1 className="text-3xl font-bold mb-6">
            Create Task
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border p-4 rounded-xl"
            />

            <input
              type="text"
              placeholder="Client Name"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="border p-4 rounded-xl"
            />

            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border p-4 rounded-xl"
            />

          </div>

          <button
            onClick={handleAddTask}
            className="bg-blue-700 text-white px-6 py-4 rounded-xl mt-5 hover:bg-blue-800"
          >
            Create Task
          </button>

        </div>

        {/* Task List */}
        <div className="bg-white rounded-2xl shadow-md p-8">

          <h2 className="text-2xl font-bold mb-6">
            Task List
          </h2>

          <div className="space-y-4">

            {tasks.length === 0 ? (
              <p>No tasks found.</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="border rounded-xl p-5"
                >
                  <div className="flex justify-between items-center">

                    <div>
                      <h3 className="text-xl font-bold">
                        {task.title}
                      </h3>

                      <p className="text-gray-500">
                        Client: {task.client}
                      </p>

                      <p className="text-gray-500">
                        Deadline: {task.deadline}
                      </p>

                      <p className="text-blue-700 font-semibold mt-2">
                        Tracking ID: {task.trackingId}
                      </p>
                    </div>

                    <select
  value={task.status}
  onChange={(e) =>
    updateTaskStatus(task.id, e.target.value)
  }
  className="border rounded-xl px-4 py-2"
>
  <option>Pending</option>
  <option>In Progress</option>
  <option>Completed</option>
  <option>Delivered</option>
</select>
<button
  onClick={() => generateInvoice(task)}
  className="bg-green-600 text-white px-4 py-2 rounded-xl mt-4"
>
  Download Invoice
</button>
                  </div>
                </div>
              ))
            )}

          </div>

        </div>

      </div>

    </main>
  );
}