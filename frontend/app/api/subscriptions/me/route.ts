import { getBackendUrl } from "@/lib/api-url";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    const apiUrl = getBackendUrl();

    const response = await fetch(`${apiUrl}/subscriptions/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
console.log("response", response);
    if (response.status === 404) {
      return NextResponse.json(null, { status: 404 });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch subscription" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("data", data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error fetching subscription:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
