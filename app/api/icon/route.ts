import { NextRequest, NextResponse } from "next/server";

const VALID_SIZES = new Set(["16", "32", "48", "96", "150", "192", "310", "512"]);
const VARIANTS = ["", "-b", "-c"];

export async function GET(req: NextRequest) {
  const size = req.nextUrl.searchParams.get("size") ?? "192";
  if (!VALID_SIZES.has(size)) {
    return new NextResponse("Invalid size", { status: 400 });
  }
  const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/icon-${size}${variant}.png`, url.origin), 302);
}
