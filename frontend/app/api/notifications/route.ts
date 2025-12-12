import { getBackendUrl } from "@/lib/api-url";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json(
        { error: "sellerId is required" },
        { status: 400 }
      );
    }

    const apiUrl = getBackendUrl();
    const response = await fetch(
      `${apiUrl}/notifications?sellerId=${sellerId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Notifications API error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

