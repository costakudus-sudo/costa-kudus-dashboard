import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const portalToken = searchParams.get("portalToken");

    if (!portalToken) {
      return NextResponse.json(
        {
          error: "Customer portal token is required.",
        },
        { status: 400 }
      );
    }

    // Find the customer using the secure server-side Admin SDK.
    const clientsSnapshot = await adminDb
      .collection("clients")
      .where("portalToken", "==", portalToken)
      .where("portalEnabled", "==", true)
      .limit(1)
      .get();

    if (clientsSnapshot.empty) {
      return NextResponse.json(
        {
          error: "Customer portal could not be verified.",
        },
        { status: 404 }
      );
    }

    const clientDoc = clientsSnapshot.docs[0];
    const client = clientDoc.data();

    // Find successful transactions belonging to this customer.
    const paymentsSnapshot = await adminDb
      .collection("paymentTransactions")
      .where("clientId", "==", clientDoc.id)
      .where("status", "==", "success")
      .get();

    if (paymentsSnapshot.empty) {
      return NextResponse.json(
        {
          success: true,
          payment: null,
        },
        { status: 200 }
      );
    }

    // Sort transactions by payment date / creation time.
    const payments = paymentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    payments.sort((a: any, b: any) => {
      const dateA = a.paidAt
        ? new Date(a.paidAt).getTime()
        : 0;

      const dateB = b.paidAt
        ? new Date(b.paidAt).getTime()
        : 0;

      return dateB - dateA;
    });

    const latestPayment = payments[0] as any;

    return NextResponse.json({
      success: true,
      payment: {
        reference:
          latestPayment.reference || latestPayment.id,

        clientId: clientDoc.id,

        clientName:
          latestPayment.clientName ||
          client.fullName ||
          "",

        email:
          latestPayment.email ||
          client.email ||
          "",

        amount: Number(
          latestPayment.amount || 0
        ),

        amountApplied: Number(
          latestPayment.amountApplied ??
            latestPayment.amount ??
            0
        ),

        currency:
          latestPayment.currency || "GHS",

        status:
          latestPayment.status || "success",

        channel:
          latestPayment.channel || "",

        paidAt:
          latestPayment.paidAt || null,

        createdAt:
          latestPayment.createdAt || null,
      },
    });
  } catch (error) {
    console.error(
      "Customer receipt error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while loading the receipt.",
      },
      { status: 500 }
    );
  }
}