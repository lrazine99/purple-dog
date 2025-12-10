import { NextRequest, NextResponse } from "next/server";
import { decodeJWTPayload } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const payload = await decodeJWTPayload(token);
    if (!payload) return NextResponse.json({ error: "Token invalide" }, { status: 401 });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${payload.sub}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { message: "Erreur lors de la récupération de l’utilisateur" };
      }
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}