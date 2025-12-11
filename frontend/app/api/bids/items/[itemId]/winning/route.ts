import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bids/items/${itemId}/winning`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // Si c'est une erreur 404 (pas d'enchère gagnante), retourner null
      if (response.status === 404) {
        return NextResponse.json(null, { status: 200 });
      }
      let error;
      try {
        const text = await response.text();
        error = text ? JSON.parse(text) : { error: "Erreur serveur" };
      } catch {
        error = { error: "Erreur serveur" };
      }
      return NextResponse.json(error, { status: response.status });
    }

    // Vérifier si la réponse a du contenu avant de parser le JSON
    const text = await response.text();
    if (!text || text.trim() === '') {
      return NextResponse.json(null, { status: 200 });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError, "Response text:", text);
      return NextResponse.json(null, { status: 200 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

