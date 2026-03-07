import { NextResponse } from "next/server";
import { generateAuthenticationOptions as generateWebAuthnAuthenticationOptions } from "@simplewebauthn/server";

const WEBAUTHN_RP_ID = process.env.WEBAUTHN_RP_ID || "localhost";

// Returns auth options for conditional mediation (passkey autofill in browser).
// No allowCredentials — the browser will show discoverable credentials for this RP.
export async function POST() {
  const options = await generateWebAuthnAuthenticationOptions({
    rpID: WEBAUTHN_RP_ID,
    allowCredentials: [],
    userVerification: "preferred",
  });

  return NextResponse.json({ options, challenge: options.challenge });
}
