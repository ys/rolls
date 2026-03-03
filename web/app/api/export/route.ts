import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Camera, Film, Roll } from "@/lib/db";

export async function GET() {
  const [cameras, films, rolls] = await Promise.all([
    sql<Camera[]>`SELECT * FROM cameras ORDER BY id`,
    sql<Film[]>`SELECT * FROM films ORDER BY id`,
    sql<Roll[]>`SELECT * FROM rolls ORDER BY roll_number DESC`,
  ]);

  return NextResponse.json({ cameras, films, rolls });
}
