import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const apiKey = process.env.API_KEY;
  const password = process.env.WEB_PASSWORD;

  const hasBearerToken =
    apiKey && request.headers.get("authorization") === `Bearer ${apiKey}`;
  const hasSessionCookie =
    !password || request.cookies.get("rolls_auth")?.value === password;

  if (pathname.startsWith("/api/")) {
    // Allow requests with a valid Bearer token (CLI) or a valid session cookie (web UI)
    if (!hasBearerToken && !hasSessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Web UI: redirect to login if password is set and cookie is missing/wrong
  if (!hasSessionCookie) {
    if (pathname === "/login") return NextResponse.next();
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
