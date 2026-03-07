import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { checkRateLimit, usernameCheckLimiter } from "@/lib/ratelimit";

// Helper to add constant delay to prevent timing attacks
async function constantTimeDelay(ms: number = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { username, invite_code } = body;

    if (!username) {
      await constantTimeDelay(100);
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check bootstrap mode (no users yet — invite not required)
    const [{ count }] = await sql<{ count: string }[]>`SELECT COUNT(*) as count FROM users`;
    const isBootstrap = parseInt(count) === 0;

    if (!isBootstrap && !invite_code) {
      await constantTimeDelay(100);
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      );
    }

    // Rate limit by IP address
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await checkRateLimit(usernameCheckLimiter, ip);

    if (!rateLimitResult.success) {
      await constantTimeDelay(100);
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Validate invite code (skip during bootstrap)
    if (!isBootstrap) {
      const [invite] = await sql<{ id: number }[]>`
        SELECT id FROM invites WHERE code = ${invite_code} LIMIT 1
      `;

      if (!invite) {
        await constantTimeDelay(100);
        return NextResponse.json(
          { error: "Invalid invite code" },
          { status: 400 }
        );
      }
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      await constantTimeDelay(100);
      return NextResponse.json(
        { available: false, error: "Invalid username format" },
        { status: 200 }
      );
    }

    // Check if username exists
    const [existingUser] = await sql<{ id: string }[]>`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `;

    // Add constant-time delay to prevent timing attacks
    const elapsed = Date.now() - startTime;
    const minResponseTime = 100; // Minimum 100ms response time
    if (elapsed < minResponseTime) {
      await constantTimeDelay(minResponseTime - elapsed);
    }

    return NextResponse.json({
      available: !existingUser,
    });
  } catch (error: any) {
    console.error("Check username error:", error);

    // Still maintain constant timing even on error
    const elapsed = Date.now() - startTime;
    const minResponseTime = 100;
    if (elapsed < minResponseTime) {
      await constantTimeDelay(minResponseTime - elapsed);
    }

    return NextResponse.json(
      { error: "Failed to check username" },
      { status: 500 }
    );
  }
}
