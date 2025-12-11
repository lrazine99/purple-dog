import { NextRequest, NextResponse } from "next/server";

// PUT - Set item categories (replace all)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes("localhost")
      ? "http://backend:3001"
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/items/${id}/categories`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to set categories" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/items/[id]/categories PUT:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Add categories to item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes("localhost")
      ? "http://backend:3001"
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/items/${id}/categories`, {
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
        { error: data.message || "Failed to add categories" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/items/[id]/categories POST:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

