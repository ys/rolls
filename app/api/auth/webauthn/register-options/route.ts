import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@/lib/auth";
import { sql, type Invite } from "@/lib/db";
import type {
  WebAuthnRegisterOptionsBody,
  WebAuthnRegisterOptionsResponse,
} from "@/app/api/_schemas/auth";
import type { ErrorResponse } from "@/app/api/_schemas/common";

/**
 * WebAuthn registration options
 * @description Returns WebAuthn registration options + the challenge to be echoed to verify.
 * @body WebAuthnRegisterOptionsBody
 * @response WebAuthnRegisterOptionsResponse
 * @add 400:ErrorResponse
 * @openapi
 */
export async function POST(request: Request) {
  try {
    const body: WebAuthnRegisterOptionsBody = await request.json();
    const { username, email, name, invite_code } = body;

    // Check if this is a bootstrap registration (no users exist yet)
    const [{ count }] = await sql<
      { count: string }[]
    >`SELECT COUNT(*) as count FROM users`;
    const isBootstrap = parseInt(count) === 0;

    // Validate required fields (invite_code optional during bootstrap)
    if (!username || !email || (!isBootstrap && !invite_code)) {
      return NextResponse.json(
        {
          error: isBootstrap
            ? "Username and email are required"
            : "Username, email, and invite code are required",
        },
        { status: 400 },
      );
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters, alphanumeric with underscores/hyphens only",
        } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    // Validate invite code (skip during bootstrap)
    if (!isBootstrap) {
      if (invite_code) {
        const [invite] = await sql<
          Invite[]
        >`SELECT * FROM invites WHERE code = ${invite_code} LIMIT 1`;
      }

      if (!invite) {
        return NextResponse.json(
          { error: "Invalid invite code" } satisfies ErrorResponse,
          { status: 400 },
        );
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "Invite code has expired" } satisfies ErrorResponse,
          { status: 400 },
        );
      }

      if (invite.max_uses !== null && invite.used_count >= invite.max_uses) {
        return NextResponse.json(
          { error: "Invite code has been fully used" } satisfies ErrorResponse,
          { status: 400 },
        );
      }
    }

    // Check if username or email already exists
    const existingUser = await sql`
      SELECT id FROM users
      WHERE username = ${username} OR email = ${email}
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username or email already in use" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    // Generate WebAuthn registration options
    const options = await generateRegistrationOptions(email, username);

    return NextResponse.json({
      options,
      // Store challenge in a way that can be retrieved during verification
      // In production, consider using a session or encrypted cookie
      challenge: options.challenge,
    } satisfies WebAuthnRegisterOptionsResponse);
  } catch (error: any) {
    console.error("Registration options error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to generate registration options",
      } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}
