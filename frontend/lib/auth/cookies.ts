import { NextResponse } from "next/server";

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  role?: string;
}

export function setAuthCookies(
  response: NextResponse,
  tokens: AuthTokens
): NextResponse {
  response.cookies.set("access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 900, // 15 minutes (synchronisé avec la durée du token)
    path: "/",
  });

  response.cookies.set("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days (synchronisé avec la durée du refresh token)
    path: "/",
  });

  // Stocker le role dans les cookies pour qu'il soit accessible côté client
  if (tokens.role) {
    response.cookies.set("user_role", tokens.role, {
      httpOnly: false, // Accessible côté client
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days (synchronisé avec la durée du refresh token)
      path: "/",
    });
  }

  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete("user_role");

  return response;
}
