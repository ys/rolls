import { sql } from "@/lib/db";
import type { Camera } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import CamerasClient from "./CamerasClient";

export const dynamic = "force-dynamic";

export default async function CamerasPage() {
  const userId = await getUserId();
  const cameras = await sql<Camera[]>`
    SELECT c.*, COUNT(r.roll_number)::int AS roll_count
    FROM cameras c
    LEFT JOIN rolls r ON r.camera_uuid = c.uuid AND r.user_id = ${userId}
    WHERE c.user_id = ${userId}
    GROUP BY c.uuid
    ORDER BY COALESCE(c.nickname, c.brand || ' ' || c.model)
  `;

  return <CamerasClient initialCameras={cameras} />;
}
