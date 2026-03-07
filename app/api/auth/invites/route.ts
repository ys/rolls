import { NextResponse } from "next/server";
import { getUser } from "@/lib/request-context";
import { sql, type Invite } from "@/lib/db";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { id: userId, role } = await getUser();
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const { max_uses, expires_in_days } = body;

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
