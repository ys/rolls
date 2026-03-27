import { getUserId } from "@/lib/request-context";
import { sql } from "@/lib/db";
import AppleSettingsClient from "./AppleSettingsClient";

export const dynamic = "force-dynamic";

export default async function AppleSettingsPage() {
  const userId = await getUserId();
  const [row] = await sql<{ apple_user_id: string | null }[]>`
    SELECT apple_user_id FROM users WHERE id = ${userId}
  `;

  return <AppleSettingsClient linked={!!row?.apple_user_id} />;
}
