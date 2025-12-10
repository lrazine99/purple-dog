import { AUTH_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/helper/routes";
import { decodeJWTPayload } from "@/lib/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Si l'utilisateur est connecté et essaie d'accéder aux pages d'authentification, rediriger vers son compte
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(ROUTES.MON_COMPTE, request.url));
  }

  // Si la route est protégée et l'utilisateur n'est pas connecté, rediriger vers la connexion
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL(ROUTES.CONNEXION, request.url));
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
