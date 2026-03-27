import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@/lib/auth";
import { generateAuthenticationOptions as generateWebAuthnAuthenticationOptions } from "@simplewebauthn/server";
import type {
  WebAuthnLoginOptionsBody,
  WebAuthnLoginOptionsResponse,
} from "@/app/api/_schemas/auth";

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

    if (!identifier) {
      // No identifier — discoverable credential flow (passkey picker, no allowCredentials)
      const rpID = process.env.WEBAUTHN_RP_ID || "localhost";
      const options = await generateWebAuthnAuthenticationOptions({
        rpID,
        allowCredentials: [],
        userVerification: "preferred",
      });
      return NextResponse.json({
        options,
        challenge: options.challenge,
        user_id: null,
      } satisfies WebAuthnLoginOptionsResponse);
    }

    // Known identifier — return credentials specific to that user
    const { options, userId } = await generateAuthenticationOptions(identifier);

    return NextResponse.json({
      options,
      challenge: options.challenge,
      user_id: userId,
    } satisfies WebAuthnLoginOptionsResponse);
  } catch (error: any) {
    console.error("Login options error:", error);

    // Don't reveal whether user exists - generic error
    return NextResponse.json(
      { error: "Authentication failed. Please check your credentials." } satisfies ErrorResponse,
      { status: 400 }
    );
  }
}
