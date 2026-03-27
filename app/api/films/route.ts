import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Film } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import { getFilms } from "@/lib/queries";
import type { ErrorResponse } from "@/app/api/_schemas/common";
import { slugify } from "@/lib/slugify";

/**
 * List films
 * @auth bearer
 * @response Film[]
 * @openapi
 */
export async function GET() {
  const userId = await getUserId();
  const rows = await getFilms(userId);
  return NextResponse.json(rows, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}

type CreateFilmBody = {
  id?: string;
  brand: string;
  name: string;
  nickname?: string;
  iso?: number;
  color?: boolean;
  slide?: boolean;
  show_iso?: boolean;
};

/**
 * Create (or upsert) a film
 * @description Slug is generated from brand+name. Upserts on (user_id, slug).
 * @auth bearer
 * @body CreateFilmBody
 * @response 201:Film
 * @add 400:ErrorResponse
 * @openapi
 */
export async function POST(request: NextRequest) {
  const userId = await getUserId();
  const body: CreateFilmBody = await request.json();
  const { id, brand, name, nickname, iso, color, slide, show_iso } = body;

  if (!brand || !name) {
    return NextResponse.json(
      { error: "brand, name are required" } satisfies ErrorResponse,
      { status: 400 }
    );
  }

  if (brand.length > 100 || name.length > 100 || (nickname && nickname.length > 100)) {
    return NextResponse.json(
      { error: "brand, name, and nickname must be 100 characters or fewer" } satisfies ErrorResponse,
      { status: 400 }
    );
  }

  const slug = id ? slugify(id) : slugify(`${brand}-${name}`);

  const rows = await sql<Film[]>`
    INSERT INTO films (slug, user_id, brand, name, nickname, iso, color, slide, show_iso)
    VALUES (${slug}, ${userId}, ${brand}, ${name}, ${nickname ?? null}, ${iso ?? null}, ${color ?? true}, ${slide ?? false}, ${show_iso ?? false})
    ON CONFLICT (user_id, slug) DO UPDATE SET brand = EXCLUDED.brand, name = EXCLUDED.name, nickname = EXCLUDED.nickname, iso = EXCLUDED.iso, color = EXCLUDED.color, slide = EXCLUDED.slide, show_iso = EXCLUDED.show_iso
    RETURNING *
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
