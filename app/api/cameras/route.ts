import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Camera } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import { getCameras } from "@/lib/queries";
import type { ErrorResponse } from "@/app/api/_schemas/common";
import { slugify } from "@/lib/slugify";

/**
 * List cameras
 * @auth bearer
 * @response Camera[]
 * @openapi
 */
export async function GET() {
  const userId = await getUserId();
  const rows = await getCameras(userId);
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}

type CreateCameraBody = {
  brand: string;
  model: string;
  nickname?: string;
  format?: number;
};

/**
 * Create (or upsert) a camera
 * @description Slug is generated from brand+model. Upserts on (user_id, slug).
 * @auth bearer
 * @body CreateCameraBody
 * @response 201:Camera
 * @add 400:ErrorResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const body: CreateCameraBody = await request.json();
  const { brand, model, nickname, format } = body;

  if (!brand || !model) {
    return NextResponse.json(
      { error: "brand, model are required" } satisfies ErrorResponse,
      { status: 400 }
    );
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
