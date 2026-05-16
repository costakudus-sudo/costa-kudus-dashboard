"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export default function ClientsPage() {

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [clients, setClients] = useState<Client[]>([]);

  // Fetch Clients
  const fetchClients = async () => {
    const querySnapshot = await getDocs(
      collection(db, "clients")
    );

    const clientData: Client[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Client, "id">),
    }));

    setClients(clientData);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Add Client
  const handleAddClient = async () => {

    if (!name || !phone) {
      alert("Please fill all required fields");
      return;
    }

    try {

      await addDoc(collection(db, "clients"), {
        name,
        phone,
        email,
        createdAt: new Date(),
      });

      alert("Client added successfully!");

      setName("");
      setPhone("");
      setEmail("");

      fetchClients();

    } catch (error) {
      console.error(error);
      alert("Error adding client");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-5xl mx-auto">

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-10">

          <h1 className="text-3xl font-bold mb-6">
            Add Client
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <input
              type="text"
              placeholder="Client Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-4 rounded-xl"
            />

            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-4 rounded-xl"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-4 rounded-xl"
            />

          </div>

          <button
            onClick={handleAddClient}
            className="bg-blue-700 text-white px-6 py-4 rounded-xl mt-5 hover:bg-blue-800"
          >
            Save Client
          </button>

        </div>

        {/* Client List */}
        <div className="bg-white rounded-2xl shadow-md p-8">

          <h2 className="text-2xl font-bold mb-6">
            Client List
          </h2>

          <div className="space-y-4">

            {clients.length === 0 ? (
              <p>No clients found.</p>
            ) : (
              clients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">
                      {client.name}
                    </h3>

                    <p className="text-gray-500">
                      {client.phone}
                    </p>

                    <p className="text-gray-500">
                      {client.email}
                    </p>
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