import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import crypto from "crypto";

/**
 * Bootstrap endpoint: creates the first user and invite code
 * Only works when users table is empty
 * DELETE THIS ENDPOINT after first user is created
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, name } = body;

    if (!email || !username) {
      return NextResponse.json(
        { error: "email and username are required" },
        { status: 400 }
      );
    }

    // Check if any users exist
    const [userCount] = await sql<{ count: string }[]>`
      SELECT COUNT(*) as count FROM users
    `;

    if (parseInt(userCount.count) > 0) {
      return NextResponse.json(
        { error: "First user already exists. Use the invite system." },
        { status: 403 }
      );
    }

    // Create first user
    const userId = crypto.randomUUID();
    const [user] = await sql<{ id: string; email: string; username: string }[]>`
      INSERT INTO users (id, email, username, name)
      VALUES (${userId}, ${email}, ${username}, ${name || null})
      RETURNING id, email, username
    `;

    // Assign all existing data to this user
    await sql`UPDATE cameras SET user_id = ${userId} WHERE user_id IS NULL`;
    await sql`UPDATE films SET user_id = ${userId} WHERE user_id IS NULL`;
    await sql`UPDATE rolls SET user_id = ${userId} WHERE user_id IS NULL`;

    // Create a permanent invite code for this user to invite others
    const inviteCode = crypto.randomBytes(6).toString("base64url").slice(0, 8);
    await sql`
      INSERT INTO invites (code, created_by, max_uses, expires_at)
      VALUES (${inviteCode}, ${userId}, NULL, NULL)
    `;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      inviteCode,
      nextSteps: [
        `Visit /register?invite=${inviteCode} to set up your passkey`,
        `After registering, you can create more invites from the Settings page`,
        `DELETE this endpoint (/api/admin/seed-first-user) after first registration`,
      ],
    });
  } catch (error: any) {
    console.error("Seed first user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to seed first user" },
      { status: 500 }
    );
  }
}
