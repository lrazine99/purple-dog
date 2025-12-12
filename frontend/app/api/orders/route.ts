import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-url";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const backendUrl = getBackendUrl();
  
  // Check if this is the my-orders route
  if (url.pathname === "/api/orders/my-orders") {
    try {
      const cookie = req.headers.get("cookie") || "";
      
      const res = await fetch(`${backendUrl}/orders/my-orders`, {
        method: "GET",
        headers: {
          Cookie: cookie,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (error) {
      console.error("Error fetching my orders:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }
  }

  // For other orders routes, proxy to backend
  try {
    const cookie = req.headers.get("cookie") || "";
    
    const res = await fetch(`${backendUrl}/orders`, {
      method: "GET",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
