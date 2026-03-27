import { NextResponse } from "next/server";
import {
  verifyAuthenticationResponse,
  createSessionToken,
  makeSessionCookie,
  getUserById,
} from "@/lib/auth";
import type { WebAuthnLoginVerifyBody } from "@/app/api/_schemas/auth";
import type { ErrorResponse, SessionAuthSuccessResponse } from "@/app/api/_schemas/common";

/**
 * WebAuthn login verify
 * @description Verifies a WebAuthn authentication response and starts a session (via Set-Cookie).
 * @body WebAuthnLoginVerifyBody
 * @response SessionAuthSuccessResponse
 * @add 400:ErrorResponse
 * @add 401:ErrorResponse
 * @add 404:ErrorResponse
 * @openapi
 */
export async function POST(request: Request) {
  try {
    const body: WebAuthnLoginVerifyBody = await request.json();
    const { response: credentialResponse, challenge, user_id: userId } = body;

    console.log("[webauthn/login-verify] credential_id=%s user_id=%s challenge=%s",
      (credentialResponse as any)?.id ?? "(none)", userId ?? "(none)", challenge ?? "(none)");

    if (!credentialResponse || !challenge) {
      console.warn("[webauthn/login-verify] missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    // Verify the authentication response (userId optional — conditional UI flow omits it)
    let verification;
    try {
      verification = await verifyAuthenticationResponse(
        credentialResponse,
        challenge,
        userId
      );
    } catch (verifyError: any) {
      console.error("[webauthn/login-verify] verifyAuthenticationResponse threw: %s", verifyError.message ?? verifyError);
      throw verifyError;
    }

    console.log("[webauthn/login-verify] verified=%s resolved_user_id=%s",
      verification.verified, verification.resolvedUserId);

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Authentication failed" } satisfies ErrorResponse,
        { status: 401 }
      );
    }

    // Get user data — use resolvedUserId from credential lookup
    const user = await getUserById(verification.resolvedUserId);

    if (!user) {
      console.warn("[webauthn/login-verify] user not found for id=%s", verification.resolvedUserId);
      return NextResponse.json(
        { error: "User not found" } satisfies ErrorResponse,
        { status: 404 }
      );
    }

    console.log("[webauthn/login-verify] success username=%s", user.username);

    // Create session token
    const token = await createSessionToken(user.id);
    const isProduction = process.env.NODE_ENV === "production";
    const cookie = makeSessionCookie(token, isProduction);

    // Return success with Set-Cookie header
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
        },
        token,
      } satisfies SessionAuthSuccessResponse),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error: any) {
    console.error("[webauthn/login-verify] unhandled error:", error.message ?? error);
    return NextResponse.json(
      { error: "Authentication failed" } satisfies ErrorResponse,
      { status: 401 }
    );
  }
}
