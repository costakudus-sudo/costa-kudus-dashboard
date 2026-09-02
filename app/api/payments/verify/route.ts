import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "../../../../lib/firebaseAdmin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: "Paystack secret key is not configured" },
        { status: 500 }
      );
    }

    // Verify transaction with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        {
          error: data.message || "Unable to verify payment",
        },
        { status: response.status || 400 }
      );
    }

    const transaction = data.data;

    // Payment must actually be successful
    if (transaction.status !== "success") {
      return NextResponse.json({
        success: false,
        status: transaction.status,
        reference: transaction.reference,
      });
    }

    // Get the Client ID from Paystack metadata
    const clientId = transaction.metadata?.clientId;

    if (!clientId) {
      return NextResponse.json(
        {
          error: "Customer information is missing from this payment.",
        },
        { status: 400 }
      );
    }

    // Prevent duplicate processing
    const paymentRef = adminDb
      .collection("paymentTransactions")
      .doc(transaction.reference);

    const existingPayment = await paymentRef.get();

    if (existingPayment.exists) {
      return NextResponse.json({
        success: true,
        paymentVerified: true,
        clientUpdated: false,
        alreadyProcessed: true,
        reference: transaction.reference,
      });
    }

    // Get the exact customer
    const clientRef = adminDb
      .collection("clients")
      .doc(clientId);

    const clientSnapshot = await clientRef.get();

    if (!clientSnapshot.exists) {
      return NextResponse.json(
        {
          error: "Customer record could not be found.",
        },
        { status: 404 }
      );
    }

    const client = clientSnapshot.data();

    if (!client) {
      return NextResponse.json(
        {
          error: "Customer information could not be loaded.",
        },
        { status: 404 }
      );
    }

    // Paystack amount is in pesewas
    const paymentAmount =
      Number(transaction.amount) / 100;

    const total = Number(
      client.total ??
        Number(client.amount || 0) -
          Number(client.discount || 0)
    );

    const currentAmountPaid = Number(
      client.amountPaid || 0
    );

    // Make sure payment does not exceed outstanding balance
    const currentBalance = Math.max(
      total - currentAmountPaid,
      0
    );

    const amountToApply = Math.min(
      paymentAmount,
      currentBalance
    );

    const newAmountPaid =
      currentAmountPaid + amountToApply;

    const newBalance = Math.max(
      total - newAmountPaid,
      0
    );

    let paymentStatus:
      | "Unpaid"
      | "Part Payment"
      | "Paid" = "Part Payment";

    if (newAmountPaid <= 0) {
      paymentStatus = "Unpaid";
    } else if (newBalance <= 0) {
      paymentStatus = "Paid";
    }

    // Update customer and create transaction record together
    const batch = adminDb.batch();

    batch.update(clientRef, {
      amountPaid: newAmountPaid,
      balance: newBalance,
      paymentStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    batch.set(paymentRef, {
      reference: transaction.reference,
      clientId,
      clientName: client.fullName || "",
      email: transaction.customer?.email || "",
      amount: paymentAmount,
      amountApplied: amountToApply,
      currency: transaction.currency || "GHS",
      status: transaction.status,
      channel: transaction.channel || "",
      paidAt: transaction.paid_at || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      paymentVerified: true,
      clientUpdated: true,
      reference: transaction.reference,
      amount: paymentAmount,
      amountPaid: newAmountPaid,
      balance: newBalance,
      paymentStatus,
    });
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while verifying payment.",
      },
      { status: 500 }
    );
  }
}