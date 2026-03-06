import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyApiKey, verifySessionToken } from "./lib/auth";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/api/auth/webauthn/register-options",
  "/api/auth/webauthn/register-verify",
  "/api/auth/webauthn/login-options",
  "/api/auth/webauthn/login-verify",
  "/api/auth/invites/validate",
  "/api/auth/check-username",
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (isPublicPath) {
    return NextResponse.next();
  }

  let user = null;

  // 1. Check for Bearer token in Authorization header (CLI/API usage)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    user = await verifyApiKey(token);
  }

  // 2. If no Bearer token, check for session cookie (web browser usage)
  if (!user) {
    const sessionCookie = request.cookies.get("session");
    if (sessionCookie) {
      const sessionData = await verifySessionToken(sessionCookie.value);
      if (sessionData) {
        // Get user from database using userId from session
        const { getUserById } = await import("./lib/auth");
        user = await getUserById(sessionData.userId);
      }
    }
  }

  // 3. If no user found, handle unauthenticated request
  if (!user) {
    // API routes: return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // UI routes: redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Inject user context headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
