import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@/lib/auth";
import type {
  WebAuthnLoginOptionsBody,
  WebAuthnLoginOptionsResponse,
} from "@/app/api/_schemas/auth";
import type { ErrorResponse } from "@/app/api/_schemas/common";

/**
 * WebAuthn login options
 * @description Returns WebAuthn authentication options + the challenge to be echoed to verify.
 * @body WebAuthnLoginOptionsBody
 * @response WebAuthnLoginOptionsResponse
 * @add 400:ErrorResponse
 * @openapi
 */
export async function POST(request: Request) {
  try {
    const body: WebAuthnLoginOptionsBody = await request.json();
    const { identifier } = body;

    console.log("[webauthn/login-options] identifier=%s", identifier ?? "(none)");

    if (!identifier) {
      return NextResponse.json(
        { error: "Email or username is required" } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    // Generate authentication options
    const { options, userId } = await generateAuthenticationOptions(identifier);

    console.log("[webauthn/login-options] ok user_id=%s challenge=%s cred_count=%d",
      userId, options.challenge, options.allowCredentials?.length ?? 0);

    return NextResponse.json({
      options,
      challenge: options.challenge,
      user_id: userId,
    } satisfies WebAuthnLoginOptionsResponse);
  } catch (error: any) {
    console.error("[webauthn/login-options] error:", error.message ?? error);

    // Don't reveal whether user exists - generic error
    return NextResponse.json(
      { error: "Authentication failed. Please check your credentials." } satisfies ErrorResponse,
      { status: 400 }
    );
  }
}
