import { NextResponse } from "next/server";
import { sql, type CatalogFilm } from "@/lib/db";

export async function GET() {
  const films = await sql<CatalogFilm[]>`
    SELECT * FROM catalog_films ORDER BY brand, name, iso
  `;
  return NextResponse.json(films);
}
