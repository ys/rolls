import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyApiKey, verifySessionToken } from "./lib/auth";

// Exact paths that don't require authentication
const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/api/auth/webauthn/register-options",
  "/api/auth/webauthn/register-verify",
  "/api/auth/webauthn/login-options",
  "/api/auth/webauthn/login-verify",
  "/api/auth/webauthn/autofill-options",
  "/api/auth/invites/validate",
  "/api/auth/check-username",
  "/api/auth/bootstrap",
  "/api/auth/apple",
]);

// Path prefixes that don't require authentication
const PUBLIC_PREFIXES = ["/.well-known/"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip any incoming x-user-* headers to prevent spoofing, regardless of auth outcome
  const safeHeaders = new Headers(request.headers);
  safeHeaders.delete("x-user-id");
  safeHeaders.delete("x-user-email");
  safeHeaders.delete("x-user-role");

  // Check if path is public (exact match only, except for well-known prefixes)
  const isPublicPath =
    PUBLIC_PATHS.has(pathname) ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isPublicPath) {
    return NextResponse.next({ request: { headers: safeHeaders } });
  }

  let user = null;

  // 1. Check for Bearer token in Authorization header (CLI/API key or JWT)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    // Try as API key first, then fall back to JWT (iOS native app)
    user = await verifyApiKey(token);
    if (!user) {
      const sessionData = await verifySessionToken(token);
      if (sessionData) {
        const { getUserById } = await import("./lib/auth");
        user = await getUserById(sessionData.userId);
      }
    }
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

  // 4. Enforce admin-only routes
  if (pathname.startsWith("/api/admin/") && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 5. Inject user context headers for downstream handlers
  const requestHeaders = safeHeaders;
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-email", user.email);
  requestHeaders.set("x-user-role", user.role);

  // 6. Update last_seen_at (fire-and-forget)
  import("./lib/auth").then(({ touchLastSeen }) => touchLastSeen(user.id));

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
