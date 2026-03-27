import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import type { ErrorResponse, SuccessResponse } from "@/app/api/_schemas/common";

const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);
const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_AUDIENCE = "computer.yannick.rolls";

/**
 * Link Apple ID to current account
 * @description Verifies an Apple identity token and links the Apple ID to the authenticated user.
 * @auth bearer
 * @body { identity_token: string }
 * @response SuccessResponse
 * @add 400:ErrorResponse
 * @add 401:ErrorResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const { identity_token } = await request.json();

    if (!identity_token) {
      return NextResponse.json(
        { error: "identity_token is required" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    let appleUserId: string;
    try {
      const { payload } = await jwtVerify(identity_token, APPLE_JWKS, {
        issuer: APPLE_ISSUER,
        audience: APPLE_AUDIENCE,
      });
      appleUserId = payload.sub as string;
    } catch {
      return NextResponse.json(
        { error: "Invalid identity token" } satisfies ErrorResponse,
        { status: 401 },
      );
    }

    // Ensure Apple ID isn't already linked to a different account
    const [existing] = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE apple_user_id = ${appleUserId} AND id != ${userId} LIMIT 1
    `;
    if (existing) {
      return NextResponse.json(
        { error: "This Apple ID is already linked to another account" } satisfies ErrorResponse,
        { status: 409 },
      );
    }

    await sql`UPDATE users SET apple_user_id = ${appleUserId} WHERE id = ${userId}`;

    return NextResponse.json({ success: true } satisfies SuccessResponse);
  } catch (error: any) {
    console.error("Apple link error:", error);
    return NextResponse.json(
      { error: "Failed to link Apple ID" } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}

/**
 * Unlink Apple ID from current account
 * @description Removes the Apple ID association from the authenticated user.
 * @auth bearer
 * @response SuccessResponse
 * @openapi
 */
export async function DELETE() {
  try {
    const userId = await getUserId();
    await sql`UPDATE users SET apple_user_id = NULL WHERE id = ${userId}`;
    return NextResponse.json({ success: true } satisfies SuccessResponse);
  } catch (error: any) {
    console.error("Apple unlink error:", error);
    return NextResponse.json(
      { error: "Failed to unlink Apple ID" } satisfies ErrorResponse,
      { status: 500 },
    );
  }
}
