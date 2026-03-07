import { NextResponse } from "next/server";
import { getUserId } from "@/lib/request-context";
import { sql } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { email_notifications } = body;

    if (typeof email_notifications !== "boolean") {
      return NextResponse.json(
        { error: "email_notifications must be a boolean" },
        { status: 400 }
      );
    }

    // Update user preferences
    await sql`
      UPDATE users
      SET email_notifications = ${email_notifications}
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      email_notifications,
    });
  } catch (error: any) {
    console.error("Update email preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update email preferences" },
      { status: 500 }
    );
  }
}
