import { NextRequest, NextResponse } from "next/server";

// DELETE - Remove photo from item
export async function DELETE(
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

    const response = await fetch(`${apiUrl}/items/${id}/photos/${photoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: data.message || "Failed to delete photo" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/items/[id]/photos/[photoId] DELETE:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

