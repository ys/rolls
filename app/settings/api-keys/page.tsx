import { getUserId } from "@/lib/request-context";
import { sql, type ApiKey } from "@/lib/db";
import ApiKeysClient from "./ApiKeysClient";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const userId = await getUserId();

  const keys = await sql<ApiKey[]>`
    SELECT id, label, last_used_at, created_at
    FROM api_keys
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return <ApiKeysClient initialKeys={keys} />;
}
