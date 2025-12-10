import { setAuthCookies } from "@/lib/auth/cookies";
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

    const res = NextResponse.json({ success: true });
    setAuthCookies(res, data);

    return res;
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
