import { sql } from "@/lib/db";
import type { Camera } from "@/lib/db";
import CamerasClient from "./CamerasClient";

export const dynamic = "force-dynamic";

export default async function CamerasPage() {
  const cameras = await sql<Camera[]>`
    SELECT c.*, COUNT(r.roll_number)::int AS roll_count
    FROM cameras c
    LEFT JOIN rolls r ON r.camera_id = c.id
    GROUP BY c.id
    ORDER BY COALESCE(c.nickname, c.brand || ' ' || c.model)
  `;

  return <CamerasClient initialCameras={cameras} />;
}
