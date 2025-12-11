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
  console.log('payload', payload);
  console.log('token', token);
  
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );


  // Si la route est protégée et l'utilisateur n'est pas connecté, rediriger vers la connexion
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL(ROUTES.CONNEXION, request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  if (isAdminRoute && payload?.role !== "admin") {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
