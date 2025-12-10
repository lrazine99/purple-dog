import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  ROUTES,
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
} from "@/helper/routes";
import { decodeJWTPayload } from "@/lib/jwt";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  const payload = token ? await decodeJWTPayload(token) : null;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) =>
      request.nextUrl.pathname === route ||
      request.nextUrl.pathname.startsWith(route + "/")
  );

  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (token && !payload) {
    if (isPublicRoute) {
      const response = NextResponse.next();
      response.cookies.delete("access_token");
      return response;
    }
    return NextResponse.redirect(new URL(ROUTES.CONNEXION, request.url));
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL(ROUTES.CONNEXION, request.url));
  }

  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  if (isAdminRoute && payload?.role !== "admin") {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
