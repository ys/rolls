import { sql } from "@/lib/db";
import { rollStatus } from "@/lib/db";
import type { Roll, Camera, Film } from "@/lib/db";
import { notFound } from "next/navigation";
import RollDetailClient from "./RollDetailClient";

export const dynamic = "force-dynamic";

type RollRow = Roll & {
  camera_brand: string | null;
  camera_model: string | null;
  camera_nickname: string | null;
  camera_format: number | null;
  film_brand: string | null;
  film_name: string | null;
  film_nickname: string | null;
  film_iso: number | null;
  film_color: boolean | null;
  film_show_iso: boolean | null;
};

export default async function RollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rows = await sql<RollRow[]>`
    SELECT r.*,
      c.brand    AS camera_brand,
      c.model    AS camera_model,
      c.nickname AS camera_nickname,
      c.format   AS camera_format,
      f.brand    AS film_brand,
      f.name     AS film_name,
      f.nickname AS film_nickname,
      f.iso      AS film_iso,
      f.color    AS film_color,
      f.show_iso AS film_show_iso
    FROM rolls r
    LEFT JOIN cameras c ON c.id = r.camera_id
    LEFT JOIN films   f ON f.id = r.film_id
    WHERE r.roll_number = ${id}
  `;

  if (rows.length === 0) notFound();

  const row = JSON.parse(JSON.stringify(rows[0])) as RollRow;
  const roll = row as Roll;
  const status = rollStatus(roll);

  const camera: Camera | null = row.camera_id ? {
    id: row.camera_id,
    brand: row.camera_brand!,
    model: row.camera_model!,
    nickname: row.camera_nickname,
    format: row.camera_format ?? 135,
  } : null;

  const film: Film | null = row.film_id ? {
    id: row.film_id,
    brand: row.film_brand!,
    name: row.film_name!,
    nickname: row.film_nickname,
    iso: row.film_iso,
    color: row.film_color ?? true,
    show_iso: row.film_show_iso ?? false,
  } : null;

  return (
    <RollDetailClient
      roll={roll}
      status={status}
      camera={camera}
      film={film}
    />
  );
}
