import { getUserId } from "@/lib/request-context";
import { sql } from "@/lib/db";
import PasskeysClient from "./PasskeysClient";

export const dynamic = "force-dynamic";

interface Credential {
  id: string;
  device_name: string | null;
  created_at: string;
  last_used_at: string | null;
}

export default async function PasskeysPage() {
  const userId = await getUserId();

  const credentials = await sql<Credential[]>`
    SELECT id, device_name, created_at, last_used_at
    FROM webauthn_credentials
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return <PasskeysClient initialCredentials={credentials} />;
}
