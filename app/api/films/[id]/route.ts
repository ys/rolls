import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Film } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: slug } = await params;
  const rows = await sql<(Film & { roll_count: number })[]>`
    SELECT f.*, COUNT(r.roll_number)::int AS roll_count
    FROM films f
    LEFT JOIN rolls r ON r.film_uuid = f.uuid AND r.user_id = ${userId}
    WHERE f.slug = ${slug} AND f.user_id = ${userId}
    GROUP BY f.uuid
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: slug } = await params;

  const rows = await sql<(Film & { roll_count: number })[]>`
    SELECT f.*, COUNT(r.roll_number)::int AS roll_count
    FROM films f
    LEFT JOIN rolls r ON r.film_uuid = f.uuid AND r.user_id = ${userId}
    WHERE f.slug = ${slug} AND f.user_id = ${userId}
    GROUP BY f.uuid
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (rows[0].roll_count > 0) {
    return NextResponse.json({ error: "Cannot delete film with rolls" }, { status: 409 });
  }

  await sql`DELETE FROM films WHERE slug = ${slug} AND user_id = ${userId}`;
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: slug } = await params;
  const { brand, name, nickname, iso, color, show_iso } = await request.json();

  if (!brand || !name) {
    return NextResponse.json({ error: "brand and name are required" }, { status: 400 });
  }

  if (brand.length > 100 || name.length > 100 || (nickname && nickname.length > 100)) {
    return NextResponse.json({ error: "brand, name, and nickname must be 100 characters or fewer" }, { status: 400 });
  }

  const rows = await sql<Film[]>`
    UPDATE films
    SET brand = ${brand}, name = ${name}, nickname = ${nickname ?? null},
        iso = ${iso ?? null}, color = ${color ?? true}, show_iso = ${show_iso ?? false}
    WHERE slug = ${slug} AND user_id = ${userId}
    RETURNING *
  `;
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
