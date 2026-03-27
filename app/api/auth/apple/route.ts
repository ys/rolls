import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { sql, type Invite, type User } from "@/lib/db";
import {
  createSessionToken,
  makeSessionCookie,
  sendWelcomeEmail,
} from "@/lib/auth";
import type { SessionAuthSuccessResponse, ErrorResponse } from "@/app/api/_schemas/common";

const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);
const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_AUDIENCES = [
  "computer.yannick.rolls",
  process.env.APPLE_WEB_CLIENT_ID,
].filter(Boolean) as string[];

type AppleAuthBody = {
  // JWT from ASAuthorizationAppleIDCredential.identityToken
  identity_token: string;
  // Only present on first sign-in
  full_name?: string;
  // Required when creating a new account
  username?: string;
  invite_code?: string;
};

/**
 * Sign in with Apple
 * @description Verifies an Apple identity token. Signs in if account exists,
 * or creates a new account (requires username + invite_code). Returns session
 * token in body for Bearer auth.
 * @body AppleAuthBody
 * @response SessionAuthSuccessResponse
 * @add 400:ErrorResponse
 * @add 401:ErrorResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const body: AppleAuthBody = await request.json();
    const { identity_token, full_name, username, invite_code } = body;

    if (!identity_token) {
      return NextResponse.json(
        { error: "identity_token is required" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    // Verify Apple identity token — try each accepted audience
    let appleUserId: string;
    let appleEmail: string | undefined;

    let verified = false;
    let verifiedPayload: any;
    for (const audience of APPLE_AUDIENCES) {
      try {
        const { payload } = await jwtVerify(identity_token, APPLE_JWKS, {
          issuer: APPLE_ISSUER,
          audience,
        });
        verifiedPayload = payload;
        verified = true;
        break;
      } catch {}
    }

    if (!verified) {
      console.error("Apple token verification failed for all audiences");
      return NextResponse.json(
        { error: "Invalid identity token" } satisfies ErrorResponse,
        { status: 401 },
      );
    }

    appleUserId = verifiedPayload.sub as string;
    appleEmail = verifiedPayload.email as string | undefined;

    // Look up existing user by Apple ID
    const [existingUser] = await sql<User[]>`
      SELECT * FROM users WHERE apple_user_id = ${appleUserId} LIMIT 1
    `;

    if (existingUser) {
      // Existing user — create session
      const token = await createSessionToken(existingUser.id);
      const isProduction = process.env.NODE_ENV === "production";
      const cookie = makeSessionCookie(token, isProduction);

      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: existingUser.id,
            username: existingUser.username,
            name: existingUser.name,
            email: existingUser.email,
          },
          token,
        } satisfies SessionAuthSuccessResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
        },
      );
    }

    // If email matches an existing user, link Apple ID to that account
    if (appleEmail) {
      const [userByEmail] = await sql<User[]>`
        SELECT * FROM users WHERE email = ${appleEmail} LIMIT 1
      `;
      if (userByEmail) {
        await sql`UPDATE users SET apple_user_id = ${appleUserId} WHERE id = ${userByEmail.id}`;
        const token = await createSessionToken(userByEmail.id);
        const isProduction = process.env.NODE_ENV === "production";
        const cookie = makeSessionCookie(token, isProduction);

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              id: userByEmail.id,
              username: userByEmail.username,
              name: userByEmail.name,
              email: userByEmail.email,
            },
            token,
          } satisfies SessionAuthSuccessResponse),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": cookie,
            },
          },
        );
      }
    }

    // New user — require username + invite code
    if (!username || !appleEmail) {
      // Signal to the iOS app that registration is required
      return NextResponse.json(
        {
          error: "new_account_required",
          email: appleEmail ?? null,
        },
        { status: 404 },
      );
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters, alphanumeric with underscores/hyphens only",
        } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    // Check if bootstrap (no users yet)
    const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM users`;
    const isBootstrap = parseInt(count) === 0;

    // Validate invite code
    let invite: Invite | undefined;
    if (!isBootstrap) {
      if (!invite_code) {
        return NextResponse.json(
          { error: "invite_code is required" } satisfies ErrorResponse,
          { status: 400 },
        );
      }
      const [found] = await sql<Invite[]>`
        SELECT * FROM invites WHERE code = ${invite_code} LIMIT 1
      `;
      if (!found) {
        return NextResponse.json(
          { error: "Invalid invite code" } satisfies ErrorResponse,
          { status: 400 },
        );
      }
      if (found.expires_at && new Date(found.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Invite code has expired" } satisfies ErrorResponse,
          { status: 400 },
        );
      }
      if (found.max_uses !== null && found.used_count >= found.max_uses) {
        return NextResponse.json(
          { error: "Invite code has been fully used" } satisfies ErrorResponse,
          { status: 400 },
        );
      }
      invite = found;
    }

    // Check username uniqueness
    const [taken] = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${appleEmail} LIMIT 1
    `;
    if (taken) {
      return NextResponse.json(
        { error: "Username or email already in use" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    // Create user
    const [newUser] = await sql<User[]>`
      INSERT INTO users (username, email, name, role, apple_user_id)
      VALUES (
        ${username},
        ${appleEmail},
        ${full_name ?? null},
        ${isBootstrap ? "admin" : "user"},
        ${appleUserId}
      )
      RETURNING *
    `;

    if (invite) {
      await sql`
        UPDATE invites
        SET used_count = used_count + 1, used_by = ${newUser.id}, used_at = NOW()
        WHERE code = ${invite.code}
      `;
    }

    sendWelcomeEmail(newUser).catch((err) =>
      console.error("Failed to send welcome email:", err),
    );

    const token = await createSessionToken(newUser.id);
    const isProduction = process.env.NODE_ENV === "production";
    const cookie = makeSessionCookie(token, isProduction);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
        },
        token,
      } satisfies SessionAuthSuccessResponse),
      {
        status: 201,
        headers: { "Content-Type": "application/json", "Set-Cookie": cookie },
      },
    );
  } catch (error: any) {
    console.error("Apple auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}
