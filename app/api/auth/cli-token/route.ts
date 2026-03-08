import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateRawApiKey, hashApiKey } from "@/lib/auth";
import { getUserId } from "@/lib/request-context";

// GET /api/auth/cli-token?callback=http://localhost:PORT/&label=CLI+prod
// Requires cookie auth. Creates an API key and redirects to the callback with ?key=rk_...
export async function GET(request: NextRequest) {
  const userId = await getUserId();

  const { searchParams } = new URL(request.url);
  const callback = searchParams.get("callback");
  const label = searchParams.get("label") ?? "CLI";
  const state = searchParams.get("state");

  if (!callback) {
    return NextResponse.json({ error: "callback is required" }, { status: 400 });
  }

  let callbackUrl: URL;
  try {
    callbackUrl = new URL(callback);
  } catch {
    return NextResponse.json({ error: "invalid callback URL" }, { status: 400 });
  }

  const host = callbackUrl.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    return NextResponse.json({ error: "callback must be localhost" }, { status: 400 });
  }

  const rawKey = generateRawApiKey();
  const keyHash = hashApiKey(rawKey);

  await sql`
    INSERT INTO api_keys (user_id, key_hash, label)
    VALUES (${userId}, ${keyHash}, ${label})
  `;

  callbackUrl.searchParams.set("key", rawKey);
  if (state) callbackUrl.searchParams.set("state", state);
  return NextResponse.redirect(callbackUrl.toString());
}
