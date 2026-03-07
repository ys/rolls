import { NextResponse } from "next/server";
import {
  verifyAuthenticationResponse,
  createSessionToken,
  makeSessionCookie,
  getUserById,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { response: credentialResponse, challenge, user_id: userId } = body;

    if (!credentialResponse || !challenge) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the authentication response (userId optional — conditional UI flow omits it)
    const verification = await verifyAuthenticationResponse(
      credentialResponse,
      challenge,
      userId
    );

    if (!verification.verified) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Get user data — use resolvedUserId from credential lookup
    const user = await getUserById(verification.resolvedUserId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create session token
    const token = await createSessionToken(user.id);
    const isProduction = process.env.NODE_ENV === "production";
    const cookie = makeSessionCookie(token, isProduction);

    // Return success with Set-Cookie header
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error: any) {
    console.error("Login verification error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
