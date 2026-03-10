import { NextResponse } from "next/server";
import { getUser } from "@/lib/request-context";
import { sql, type Invite } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId, role } = await getUser();
    const { id } = await params;

    // Get invite before deleting to check if it was unused
    const [invite] = await sql<Invite[]>`
      SELECT used_count FROM invites
      WHERE id = ${id} AND created_by = ${userId}
    `;

    if (!invite) {
      return NextResponse.json(
        { error: "Invite not found" },
        { status: 404 }
      );
    }

    // Delete invite (only if owned by user)
    await sql`
      DELETE FROM invites
      WHERE id = ${id} AND created_by = ${userId}
    `;

    // If invite was unused and user is not admin, decrement invites_sent
    if (invite.used_count === 0 && role !== "admin") {
      await sql`
        UPDATE users
        SET invites_sent = GREATEST(0, invites_sent - 1)
        WHERE id = ${userId}
      `;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Delete invite error:", error);
    return NextResponse.json(
      { error: "Failed to delete invite" },
      { status: 500 }
    );
  }
}
