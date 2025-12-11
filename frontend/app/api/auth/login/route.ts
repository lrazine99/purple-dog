import { setAuthCookies } from "@/lib/auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Use backend hostname for server-side API calls (Docker network)
    // NEXT_PUBLIC_API_URL is http://localhost:3001 which doesn't work inside Docker
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
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

    // Fetch user data to return it for role-based redirect
     const userResponse = await fetch(
      `${apiUrl}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      }
    );

    let userData = null;
    if (userResponse.ok) {
      userData = await userResponse.json();
    }

    const res = NextResponse.json({ ...data, user: userData });
    setAuthCookies(res, data);

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
