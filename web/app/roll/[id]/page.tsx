import { sql } from "@/lib/db";
import { rollStatus } from "@/lib/db";
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
    sql<Camera[]>`SELECT * FROM cameras ORDER BY id`,
    sql<Film[]>`SELECT * FROM films ORDER BY id`,
  ]);

  if (rolls.length === 0) notFound();

  // Force Date objects from the postgres driver into ISO strings so the client
  // component receives plain serializable data.
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
