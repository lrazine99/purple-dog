import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/me`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 404) {
      return Response.json(null, { status: 404 });
    }

    if (!response.ok) {
      return Response.json(
        { error: "Failed to fetch subscription" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
