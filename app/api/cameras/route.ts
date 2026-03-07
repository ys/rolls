import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Camera } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import { getCameras } from "@/lib/queries";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  const userId = await getUserId();
  const rows = await getCameras(userId);
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const body = await request.json();
  const { brand, model, nickname, format } = body;

  if (!brand || !model) {
    return NextResponse.json({ error: "brand, model are required" }, { status: 400 });
  }

  // Generate slug server-side
  const slug = slugify(`${brand}-${model}`);

  const rows = await sql<Camera[]>`
    INSERT INTO cameras (slug, user_id, brand, model, nickname, format)
    VALUES (${slug}, ${userId}, ${brand}, ${model}, ${nickname ?? null}, ${format ?? 135})
    ON CONFLICT (user_id, slug) DO UPDATE SET brand = EXCLUDED.brand, model = EXCLUDED.model, nickname = EXCLUDED.nickname, format = EXCLUDED.format
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
