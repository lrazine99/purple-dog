import { NextRequest, NextResponse } from "next/server";

// GET all categories
export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/categories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch categories" },
        { status: response.status }
      );
    }

    const categories = await response.json();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error in /api/categories GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create category" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/categories POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
