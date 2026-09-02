import { NextResponse } from "next/server";
import { adminDb } from "../../../../lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      email,
      amount,
      reference,
      callback_url,
      portalToken,
    } = body;

    if (!amount || !portalToken) {
      return NextResponse.json(
        {
          error: "Amount and portal token are required",
        },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          error: "Paystack secret key is not configured",
        },
        { status: 500 }
      );
    }

    // Find the customer using their portal token
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

    // Calculate the customer's actual outstanding balance
    const subtotal = Number(client.amount || 0);
    const discount = Number(client.discount || 0);

    const total = Number(
      client.total ?? subtotal - discount
    );

    const amountPaid = Number(client.amountPaid || 0);

    const balance = Math.max(
      total - amountPaid,
      0
    );

    // Make sure the requested payment matches the balance
    const requestedAmount = Number(amount);

    if (
      !Number.isFinite(requestedAmount) ||
      requestedAmount <= 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid payment amount.",
        },
        { status: 400 }
      );
    }

    if (requestedAmount > balance) {
      return NextResponse.json(
        {
          error:
            "Payment amount cannot be greater than the outstanding balance.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email:
            email ||
            client.email ||
            "customer@costakudustech.com",

          amount: Math.round(
            requestedAmount * 100
          ),

          reference,

          callback_url,

          metadata: {
            clientId: clientDoc.id,
            portalToken,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        {
          error:
            data.message ||
            "Unable to initialize payment",
        },
        { status: response.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      authorization_url:
        data.data.authorization_url,
      access_code:
        data.data.access_code,
      reference:
        data.data.reference,
    });
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while initializing payment",
      },
      { status: 500 }
    );
  }
}