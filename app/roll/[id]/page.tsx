import { sql } from "@/lib/db";
import { rollStatus } from "@/lib/status";
import type { Roll, Camera, Film } from "@/lib/db";
import { notFound } from "next/navigation";
import RollDetailClient from "./RollDetailClient";

export const dynamic = "force-dynamic";

export default async function RollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [rolls, cameras, films] = await Promise.all([
    sql<Roll[]>`SELECT * FROM rolls WHERE roll_number = ${id}`,
    sql<Camera[]>`
      SELECT c.*, COUNT(r.roll_number)::int AS roll_count
      FROM cameras c LEFT JOIN rolls r ON r.camera_uuid = c.uuid
      GROUP BY c.uuid ORDER BY COUNT(r.roll_number) DESC
    `,
    sql<Film[]>`
      SELECT f.*, COUNT(r.roll_number)::int AS roll_count
      FROM films f LEFT JOIN rolls r ON r.film_uuid = f.uuid
      GROUP BY f.uuid ORDER BY COUNT(r.roll_number) DESC
    `,
  ]);

  if (rolls.length === 0) notFound();

  const roll = JSON.parse(JSON.stringify(rolls[0])) as Roll;
  const status = rollStatus(roll);

  return (
    <RollDetailClient
      roll={roll}
      status={status}
      cameras={cameras}
      films={films}
    />
  );
}
