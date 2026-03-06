import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: "Email or username is required" },
        { status: 400 }
      );
    }

    // Generate authentication options
    const { options, userId } = await generateAuthenticationOptions(identifier);

    return NextResponse.json({
      options,
      challenge: options.challenge,
      userId, // Need this for verification step
    });
  } catch (error: any) {
    console.error("Login options error:", error);

    // Don't reveal whether user exists - generic error
    return NextResponse.json(
      { error: "Authentication failed. Please check your credentials." },
      { status: 400 }
    );
  }
}
