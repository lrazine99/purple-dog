import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-url";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const apiUrl = getBackendUrl();

    const response = await fetch(
      `${apiUrl}/orders/my-orders`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch my orders" },
        { status: response.status }
      );
    }

    const orders = await response.json();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error in /api/orders/my-orders GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
