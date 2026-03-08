import { NextRequest, NextResponse } from "next/server";

const SOURCES = [
  "/apple-touch-icon.png",
  "/apple-touch-icon-36.png",
  "/apple-touch-icon-strip.png",
];

export async function GET(req: NextRequest) {
  const src = SOURCES[Math.floor(Math.random() * SOURCES.length)];
  return NextResponse.redirect(new URL(src, new URL(req.url).origin), 302);
}
