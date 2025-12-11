import { getBackendUrl } from "@/lib/api-url";
import { NextRequest, NextResponse } from "next/server";

// Proxy uploaded files from backend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const filePath = path.join("/");
    const apiUrl = getBackendUrl();

    const response = await fetch(`${apiUrl}/upload/${filePath}`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "File not found" },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error proxying upload:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}
