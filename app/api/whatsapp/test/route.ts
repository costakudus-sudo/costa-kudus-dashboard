import { NextResponse } from "next/server";

export async function GET() {
  try {
    const accessToken = process.env.WAWP_ACCESS_TOKEN;
    const instanceId = process.env.WAWP_INSTANCE_ID;

    if (!accessToken || !instanceId) {
      return NextResponse.json({
        success: false,
        error: "Wawp credentials are missing",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Wawp credentials are loaded successfully",
      instanceId,
      tokenLoaded: true,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Something went wrong",
    });
  }
}