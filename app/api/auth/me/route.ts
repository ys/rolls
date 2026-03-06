import { NextResponse } from "next/server";
import { getUserId } from "@/lib/request-context";
import { sql, type User, type WebAuthnCredential } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getUserId();

    // Get user
    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE id = ${userId} LIMIT 1
    `;

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user's credentials
    const credentials = await sql<WebAuthnCredential[]>`
      SELECT id, device_name, last_used_at, created_at
      FROM webauthn_credentials
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        email_notifications: user.email_notifications,
      },
      credentials: credentials.map((cred) => ({
        id: cred.id,
        device_name: cred.device_name,
        last_used_at: cred.last_used_at,
        created_at: cred.created_at,
      })),
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to get user data" },
      { status: 500 }
    );
  }
}
