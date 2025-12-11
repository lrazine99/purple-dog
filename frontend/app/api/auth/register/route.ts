import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Vérifier si c'est un FormData (professional avec fichier) ou JSON (particular)
    const contentType = request.headers.get("content-type");
    const isFormData = contentType?.includes("multipart/form-data");

    let body: FormData | string;
    let headers: HeadersInit = {};

    if (isFormData) {
      // Professional avec fichier - utiliser FormData
      const formData = await request.formData();
      body = formData;
      // Ne pas définir Content-Type pour FormData, le navigateur le gère automatiquement
    } else {
      // Particular sans fichier - utiliser JSON
      const jsonData = await request.json();
      body = JSON.stringify(jsonData);
      headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
      method: "POST",
      headers,
      body: body as BodyInit,
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { message: "Erreur lors de l'inscription" };
      }
      return NextResponse.json(
        { error: error.message || "Erreur lors de l'inscription" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
