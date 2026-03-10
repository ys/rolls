import { NextResponse } from "next/server";
import { getUser } from "@/lib/request-context";
import { sql, type Invite, type User } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { id: userId } = await getUser();

    // Get all invites created by this user
    const invites = await sql<Invite[]>`
      SELECT * FROM invites
      WHERE created_by = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      invites: invites.map((invite) => ({
        ...invite,
        // Calculate if invite is still valid
        isValid:
          (!invite.expires_at || new Date(invite.expires_at) > new Date()) &&
          (invite.max_uses === null || invite.used_count < invite.max_uses),
      })),
    });
  } catch (error: any) {
    console.error("List invites error:", error);
    return NextResponse.json(
      { error: "Failed to list invites" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { id: userId, role } = await getUser();

    // Get user's invite quota
    const [user] = await sql<User[]>`
      SELECT invite_quota, invites_sent FROM users
      WHERE id = ${userId}
    `;

    const isAdmin = role === "admin";
    const remainingInvites = user.invite_quota !== null ? user.invite_quota - user.invites_sent : null;

    // Check if user has invites remaining (admins have unlimited)
    if (!isAdmin && (remainingInvites === null || remainingInvites <= 0)) {
      return NextResponse.json(
        { error: "You have no invites remaining" },
        { status: 403 }
      );
    }

    const body = await request.json();
    let { max_uses, expires_in_days } = body;

    // Normal users get single-use invites only
    if (!isAdmin) {
      max_uses = 1;
      expires_in_days = null;
    }

    // Generate unique invite code (8 chars, URL-safe)
    const code = crypto.randomBytes(6).toString("base64url").slice(0, 8);

    // Calculate expiration if specified
    let expiresAt = null;
    if (expires_in_days && expires_in_days > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in_days);
    }

    const [invite] = await sql<Invite[]>`
      INSERT INTO invites (code, created_by, max_uses, expires_at)
      VALUES (${code}, ${userId}, ${max_uses || null}, ${expiresAt})
      RETURNING *
    `;

    // Increment invites_sent counter for normal users
    if (!isAdmin) {
      await sql`
        UPDATE users
        SET invites_sent = invites_sent + 1
        WHERE id = ${userId}
      `;
    }

    return NextResponse.json({
      invite: {
        ...invite,
        isValid: true, // Newly created invite is always valid
      },
    });
  } catch (error: any) {
    console.error("Create invite error:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}
