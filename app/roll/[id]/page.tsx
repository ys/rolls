import { sql } from "@/lib/db";
import { rollStatus } from "@/lib/status";
import type { Roll, Camera, Film, CatalogFilm } from "@/lib/db";
import { notFound } from "next/navigation";
import { getUserId } from "@/lib/request-context";
import RollDetailClient from "./RollDetailClient";

export const dynamic = "force-dynamic";

export default async function RollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserId();

  const [rolls, cameras, films, catalogFilms] = await Promise.all([
    sql<(Roll & {
      camera_nickname: string | null;
      camera_brand: string | null;
      camera_model: string | null;
      film_nickname: string | null;
      film_brand: string | null;
      film_name: string | null;
      film_iso: number | null;
      film_show_iso: boolean | null;
    })[]>`
      SELECT
        r.*,
        c.nickname AS camera_nickname,
        c.brand AS camera_brand,
        c.model AS camera_model,
        f.nickname AS film_nickname,
        f.brand AS film_brand,
        f.name AS film_name,
        f.iso AS film_iso,
        f.show_iso AS film_show_iso
      FROM rolls r
      LEFT JOIN cameras c ON r.camera_uuid = c.uuid
      LEFT JOIN films f ON r.film_uuid = f.uuid
      WHERE r.roll_number = ${id} AND r.user_id = ${userId}
    `,
    sql<Camera[]>`
      SELECT c.*, COUNT(r.roll_number)::int AS roll_count
      FROM cameras c
      LEFT JOIN rolls r ON r.camera_uuid = c.uuid AND r.user_id = ${userId}
      WHERE c.user_id = ${userId}
      GROUP BY c.uuid ORDER BY COUNT(r.roll_number) DESC
    `,
    sql<Film[]>`
      SELECT f.*, COUNT(r.roll_number)::int AS roll_count
      FROM films f
      LEFT JOIN rolls r ON r.film_uuid = f.uuid AND r.user_id = ${userId}
      WHERE f.user_id = ${userId}
      GROUP BY f.uuid ORDER BY COUNT(r.roll_number) DESC
    `,
    sql<CatalogFilm[]>`SELECT * FROM catalog_films ORDER BY brand, name, iso`.catch(() => [] as CatalogFilm[]),
  ]);

  if (rolls.length === 0) notFound();

  const roll = JSON.parse(JSON.stringify(rolls[0])) as Roll & {
    camera_nickname: string | null;
    camera_brand: string | null;
    camera_model: string | null;
    film_nickname: string | null;
    film_brand: string | null;
    film_name: string | null;
    film_iso: number | null;
    film_show_iso: boolean | null;
  };
  const contactSheetUrl = roll.contact_sheet_url;

  return (
    <RollDetailClient
      roll={roll}
      contactSheetUrl={contactSheetUrl}
      cameras={cameras}
      films={films}
      catalogFilms={catalogFilms}
    />
  );
}
