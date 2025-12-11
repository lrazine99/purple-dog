import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Use backend hostname when running inside Docker (frontend container)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.includes("localhost")
      ? "http://backend:3001"
      : process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Upload failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

