import { NextRequest, NextResponse } from "next/server";

// PATCH - Update order
export async function PATCH(
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
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/orders/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to update order" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/orders/[id] PATCH:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Delete order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { id } = await params;
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes('localhost') 
      ? 'http://backend:3001' 
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/orders/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to delete order" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/orders/[id] DELETE:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

