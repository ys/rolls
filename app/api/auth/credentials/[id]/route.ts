import { NextResponse } from "next/server";
import { getUserId } from "@/lib/request-context";
import { getUserById, sendSecurityNotification } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId();
    const { id } = await params;

    // Get credential details before deleting
    const [credential] = await sql<{ device_name: string | null }[]>`
      SELECT device_name FROM webauthn_credentials
      WHERE id = ${id} AND user_id = ${userId}
      LIMIT 1
    `;

    if (!credential) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    // Delete credential
    await sql`
      DELETE FROM webauthn_credentials
      WHERE id = ${id} AND user_id = ${userId}
    `;

    // Send security notification (async)
    const user = await getUserById(userId);
    if (user) {
      sendSecurityNotification(user, {
        type: "passkey_deleted",
        details: credential.device_name || "Unnamed passkey",
      }).catch((err) => console.error("Failed to send security notification:", err));
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Delete credential error:", error);
    return NextResponse.json(
      { error: "Failed to delete credential" },
      { status: 500 }
    );
  }
}
