import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      portalToken,
      service,
      serviceDetails,
      preferredDate,
      notes,
    } = body;

    if (!portalToken) {
      return NextResponse.json(
        { error: "Customer portal token is required." },
        { status: 400 }
      );
    }

    if (!service) {
      return NextResponse.json(
        { error: "Please select a service." },
        { status: 400 }
      );
    }

    if (!serviceDetails?.trim()) {
      return NextResponse.json(
        { error: "Please describe what you need." },
        { status: 400 }
      );
    }

    // Verify customer securely on the server
    const clientsSnapshot = await adminDb
      .collection("clients")
      .where("portalToken", "==", portalToken)
      .where("portalEnabled", "==", true)
      .limit(1)
      .get();

    if (clientsSnapshot.empty) {
      return NextResponse.json(
        { error: "Customer portal could not be verified." },
        { status: 404 }
      );
    }

    const clientDoc = clientsSnapshot.docs[0];
    const client = clientDoc.data();

    // Create the new job request
    const jobRef = await adminDb.collection("jobs").add({
      clientId: clientDoc.id,
      clientName: client.fullName || "",
      phone: client.phone || "",
      email: client.email || "",
      service,
      serviceDetails: serviceDetails.trim(),

      // Customer requests do not have a price yet.
      amount: 0,

      // Initial job/payment status
      jobStatus: "Pending",
      paymentStatus: "Unpaid",

      scheduledDate: preferredDate || "",

      notes: notes?.trim() || "",

      source: "Customer Portal",
      requestStatus: "New",

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      {
        success: true,
        jobId: jobRef.id,
        message: "Job request submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Customer order error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while submitting your request.",
      },
      { status: 500 }
    );
  }
}