import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@/lib/auth";
import { sql, type Invite } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, name, invite_code } = body;

    // Validate required fields
    if (!username || !email || !invite_code) {
      return NextResponse.json(
        { error: "Username, email, and invite code are required" },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters, alphanumeric with underscores/hyphens only" },
        { status: 400 }
      );
    }

    // Validate invite code
    const [invite] = await sql<Invite[]>`
      SELECT * FROM invites WHERE code = ${invite_code} LIMIT 1
    `;

    if (!invite) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    // Check if invite is expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invite code has expired" },
        { status: 400 }
      );
    }

    // Check if invite has reached max uses
    if (invite.max_uses !== null && invite.used_count >= invite.max_uses) {
      return NextResponse.json(
        { error: "Invite code has been fully used" },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = await sql`
      SELECT id FROM users
      WHERE username = ${username} OR email = ${email}
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username or email already in use" },
        { status: 400 }
      );
    }

    // Generate WebAuthn registration options
    const options = await generateRegistrationOptions(email, username);

    return NextResponse.json({
      options,
      // Store challenge in a way that can be retrieved during verification
      // In production, consider using a session or encrypted cookie
      challenge: options.challenge,
    });
  } catch (error: any) {
    console.error("Registration options error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate registration options" },
      { status: 500 }
    );
  }
}
