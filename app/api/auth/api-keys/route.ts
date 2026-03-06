import { NextResponse } from "next/server";
import { getUserId } from "@/lib/request-context";
import {
  generateRawApiKey,
  hashApiKey,
  getUserById,
  sendSecurityNotification,
} from "@/lib/auth";
import { sql, type ApiKey } from "@/lib/db";

export async function GET() {
  try {
    const userId = await getUserId();

    const apiKeys = await sql<ApiKey[]>`
      SELECT id, label, last_used_at, created_at
      FROM api_keys
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      api_keys: apiKeys,
    });
  } catch (error: any) {
    console.error("Get API keys error:", error);
    return NextResponse.json(
      { error: "Failed to get API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { label } = body;

    // Generate new API key
    const rawKey = generateRawApiKey();
    const keyHash = hashApiKey(rawKey);

    // Store in database
    const [apiKey] = await sql<ApiKey[]>`
      INSERT INTO api_keys (user_id, key_hash, label)
      VALUES (${userId}, ${keyHash}, ${label || null})
      RETURNING id, label, created_at
    `;

    // Send security notification (async)
    const user = await getUserById(userId);
    if (user) {
      sendSecurityNotification(user, {
        type: "api_key_created",
        details: label || "Unlabeled API key",
      }).catch((err) => console.error("Failed to send security notification:", err));
    }

    return NextResponse.json({
      api_key: {
        id: apiKey.id,
        label: apiKey.label,
        created_at: apiKey.created_at,
      },
      raw_key: rawKey, // Only shown once!
    });
  } catch (error: any) {
    console.error("Create API key error:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
