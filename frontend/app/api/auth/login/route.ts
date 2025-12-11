import { setAuthCookies } from "@/lib/auth/cookies";
import { decodeJWTPayload } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { message: "Erreur lors de la connexion" };
      }
      return NextResponse.json(
        { error: error.message || "Erreur lors de la connexion" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Décoder le access_token pour obtenir les infos utilisateur
    if (!data.access_token) {
      console.error("Missing access_token in backend response");
      return NextResponse.json(
        { error: "Token manquant dans la réponse du serveur" },
        { status: 500 }
      );
    }

    const payload = await decodeJWTPayload(data.access_token);
    console.log("PAYLOAD LOGIN", payload);
    if (!payload) {
      return NextResponse.json(
        { error: "Erreur lors du décodage du token" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      success: true,
      id: payload.sub,
      email: payload.email,
      role: data.role,
    });
    setAuthCookies(res, data);

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
