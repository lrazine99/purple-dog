import { NextRequest, NextResponse } from "next/server";

// PATCH - Set photo as primary
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const { id, photoId } = await params;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes("localhost")
      ? "http://backend:3001"
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/items/${id}/photos/${photoId}/primary`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to set primary photo" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/items/[id]/photos/[photoId]/primary PATCH:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

