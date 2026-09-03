import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone and message are required",
        },
        { status: 400 }
      );
    }

    const accessToken = process.env.WAWP_ACCESS_TOKEN;
    const instanceId = process.env.WAWP_INSTANCE_ID;

    if (!accessToken || !instanceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Wawp credentials are missing",
        },
        { status: 500 }
      );
    }

    // Remove spaces, + sign and other characters
    // so Ghana numbers can be sent as 233XXXXXXXXX
    const cleanPhone = String(phone).replace(/\D/g, "");

    const response = await fetch(
      "https://api.wawp.net/v2/send/text",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instance_id: instanceId,
          access_token: accessToken,
          chatId: `${cleanPhone}@c.us`,
          message: String(message),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Wawp API error:", data);

      return NextResponse.json(
        {
          success: false,
          error: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp message sent successfully",
      data,
    });
  } catch (error) {
    console.error("WhatsApp error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send WhatsApp message",
      },
      { status: 500 }
    );
  }
}