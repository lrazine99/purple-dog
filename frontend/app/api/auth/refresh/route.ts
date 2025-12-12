import { setAuthCookies } from "@/lib/auth/cookies";
import { decodeJWTPayload } from "@/lib/jwt";
import { getBackendUrl } from "@/lib/api-url";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token manquant" },
        { status: 401 }
      );
    }

    const apiUrl = getBackendUrl();
    const response = await fetch(
      `${apiUrl}/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) {
      const res = NextResponse.json(
        { error: "Token de rafraîchissement invalide" },
        { status: 401 }
      );
      // Supprimer les cookies en cas d'erreur
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      res.cookies.delete("user_role");
      return res;
    }

    const data = await response.json();

    // Décoder le nouveau access_token pour obtenir les infos utilisateur
    const payload = await decodeJWTPayload(data.access_token);

    if (!payload) {
      const res = NextResponse.json(
        { error: "Erreur lors du décodage du token" },
        { status: 500 }
      );
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      res.cookies.delete("user_role");
      return res;
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
    const res = NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    res.cookies.delete("user_role");
    return res;
  }
}
