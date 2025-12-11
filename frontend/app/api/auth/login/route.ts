import { setAuthCookies } from "@/lib/auth/cookies";
import { decodeJWTPayload } from "@/lib/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Use backend hostname for server-side API calls (Docker network)
    // NEXT_PUBLIC_API_URL is often http://localhost:3001 which doesn't work inside Docker
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes("localhost")
      ? "http://backend:3001"
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(
      `${apiUrl}/auth/login`,
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
    if (!payload) {
      return NextResponse.json(
        { error: "Erreur lors du décodage du token" },
        { status: 500 }
      );
    }

    // Fetch user data to return it for role-based redirect
    let userData: unknown = null;
    try {
      const userResponse = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });

      if (userResponse.ok) {
        userData = await userResponse.json();
      }
    } catch (error) {
      console.error("Error fetching /auth/me:", error);
    }

    const res = NextResponse.json({
      success: true,
      id: payload.sub,
      email: payload.email,
      role: data.role,
      user: userData,
    });
    setAuthCookies(res, data);

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
