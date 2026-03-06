import { NextResponse } from "next/server";
import { getUserId } from "@/lib/request-context";
import { getUserById, sendInviteEmail } from "@/lib/auth";
import { sql, type Invite } from "@/lib/db";
import { checkRateLimit, emailLimiter } from "@/lib/ratelimit";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { invite_code, email, message } = body;

    if (!invite_code || !email) {
      return NextResponse.json(
        { error: "Invite code and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Rate limit by user ID
    const rateLimitResult = await checkRateLimit(emailLimiter, userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Verify invite exists and is owned by user
    const [invite] = await sql<Invite[]>`
      SELECT * FROM invites
      WHERE code = ${invite_code} AND created_by = ${userId}
      LIMIT 1
    `;

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    // Check if invite is still valid
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invite has expired" },
        { status: 400 }
      );
    }

    if (invite.max_uses !== null && invite.used_count >= invite.max_uses) {
      return NextResponse.json(
        { error: "Invite has been fully used" },
        { status: 400 }
      );
    }

    // Get inviter's name
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 500 }
      );
    }

    // Send invite email
    await sendInviteEmail(
      email,
      invite_code,
      user.name || user.username,
      message
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Send invite error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send invite" },
      { status: 500 }
    );
  }
}
