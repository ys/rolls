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

    // Check if this is a bootstrap registration (no users exist yet)
    const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM users`;
    const isBootstrap = parseInt(count) === 0;

    // Validate required fields (invite_code optional during bootstrap)
    if (!username || !email || (!isBootstrap && !invite_code) || !credentialResponse || !challenge) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate invite code (skip during bootstrap)
    let invite: Invite | undefined;
    if (!isBootstrap) {
      const [found] = await sql<Invite[]>`
        SELECT * FROM invites WHERE code = ${invite_code} LIMIT 1
      `;

      if (!found) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 400 });
      }

      if (found.expires_at && new Date(found.expires_at) < new Date()) {
        return NextResponse.json({ error: "Invite code has expired" }, { status: 400 });
      }

      if (found.max_uses !== null && found.used_count >= found.max_uses) {
        return NextResponse.json({ error: "Invite code has been fully used" }, { status: 400 });
      }

      invite = found;
    }

    // Verify the WebAuthn credential
    const verification = await verifyRegistrationResponse(credentialResponse, challenge);

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "Credential verification failed" },
        { status: 400 }
      );
    }

    // Create user — first user gets 'admin' role
    const [user] = await sql<User[]>`
      INSERT INTO users (username, email, name, role)
      VALUES (${username}, ${email}, ${name || null}, ${isBootstrap ? "admin" : "user"})
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

    // Update invite usage (skip during bootstrap — no invite was used)
    if (invite) {
      await sql`
        UPDATE invites
        SET used_count = used_count + 1,
            used_by = ${user.id},
            used_at = NOW()
        WHERE code = ${invite_code}
      `;
    }

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
