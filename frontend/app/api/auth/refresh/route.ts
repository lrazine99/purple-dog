import { NextRequest, NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token manquant" },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
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
    const res = NextResponse.json({ success: true });
    setAuthCookies(res, data);

    return res;
  } catch (error) {
    const res = NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    res.cookies.delete("user_role");
    return res;
  }
}

