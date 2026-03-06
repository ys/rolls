import { NextResponse } from "next/server";
import {
  verifyRegistrationResponse,
  createSessionToken,
  makeSessionCookie,
  sendWelcomeEmail,
} from "@/lib/auth";
import { sql, type Invite, type User } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      name,
      invite_code,
      response: credentialResponse,
      challenge,
      device_name,
    } = body;

    // Validate required fields
    if (!username || !email || !invite_code || !credentialResponse || !challenge) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate invite code again (double-check)
    const [invite] = await sql<Invite[]>`
      SELECT * FROM invites WHERE code = ${invite_code} LIMIT 1
    `;

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invite code has expired" },
        { status: 400 }
      );
    }

    if (invite.max_uses !== null && invite.used_count >= invite.max_uses) {
      return NextResponse.json(
        { error: "Invite code has been fully used" },
        { status: 400 }
      );
    }

    // Verify the WebAuthn credential
    const verification = await verifyRegistrationResponse(credentialResponse, challenge);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "Credential verification failed" },
        { status: 400 }
      );
    }

    // Create user in transaction
    const [user] = await sql<User[]>`
      INSERT INTO users (username, email, name)
      VALUES (${username}, ${email}, ${name || null})
      RETURNING *
    `;

    // Store WebAuthn credential
    const { credential } = verification.registrationInfo;

    await sql`
      INSERT INTO webauthn_credentials (
        user_id,
        credential_id,
        public_key,
        counter,
        transports,
        device_name
      )
      VALUES (
        ${user.id},
        ${Buffer.from(credential.id).toString("base64url")},
        ${Buffer.from(credential.publicKey).toString("base64")},
        ${credential.counter},
        ${credential.transports ? sql.array(credential.transports) : null},
        ${device_name || null}
      )
    `;

    // Update invite usage
    await sql`
      UPDATE invites
      SET used_count = used_count + 1,
          used_by = ${user.id},
          used_at = NOW()
      WHERE code = ${invite_code}
    `;

    // Send welcome email (async, don't block response)
    sendWelcomeEmail(user).catch((err) =>
      console.error("Failed to send welcome email:", err)
    );

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
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error: any) {
    console.error("Registration verification error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
