import { getBackendUrl } from "@/lib/api-url";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const apiUrl = getBackendUrl();
    const checkoutUrl = `${apiUrl}/subscriptions/checkout`;

    const response = await fetch(checkoutUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || "Erreur lors de la création du checkout" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
