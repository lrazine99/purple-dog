import { NextRequest, NextResponse } from "next/server";

// GET all items
export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    // Forward query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = queryString ? `${apiUrl}/items?${queryString}` : `${apiUrl}/items`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch items" },
        { status: response.status }
      );
    }

    const items = await response.json();
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error in /api/items GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
