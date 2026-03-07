import { NextResponse } from "next/server";
import { sql, type Invite } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Check if invite exists and is valid
    const [invite] = await sql<Invite[]>`
      SELECT * FROM invites WHERE code = ${code} LIMIT 1
    `;

    if (!invite) {
      return NextResponse.json(
        { valid: false, error: "Invalid invite code" },
        { status: 200 }
      );
    }

    // Check if expired
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Invite code has expired" },
        { status: 200 }
      );
    }

    // Check if max uses reached
    if (invite.max_uses !== null && invite.used_count >= invite.max_uses) {
      return NextResponse.json(
        { valid: false, error: "Invite code has been fully used" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
    });
  } catch (error: any) {
    console.error("Validate invite error:", error);
    return NextResponse.json(
      { error: "Failed to validate invite" },
      { status: 500 }
    );
  }
}
