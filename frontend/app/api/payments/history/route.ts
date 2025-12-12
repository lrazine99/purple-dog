import { NextRequest, NextResponse } from "next/server";

/**
 * This route is deprecated - payments are now fetched directly from the backend
 * which stores them in the database. Use paymentService.getPaymentHistory() instead.
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: "This endpoint is deprecated. Use the backend API /payments instead.",
      data: [],
    },
    { status: 410 }
  );
}

