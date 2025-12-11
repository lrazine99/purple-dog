import { NextRequest, NextResponse } from "next/server";

// GET single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { id } = await params; // ✅ Await params first
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/items/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch item" },
        { status: response.status }
      );
    }

    const item = await response.json();
    return NextResponse.json(item);
  } catch (error) {
    console.error("Error in /api/items/[id] GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { id } = await params; // ✅ Await params first
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to delete item" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/items/[id] DELETE:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
