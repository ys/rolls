import { sql } from "@/lib/db";
import type { Invite, User } from "@/lib/db";
import { getUser } from "@/lib/request-context";
import InvitesClient from "./InvitesClient";

export const dynamic = "force-dynamic";

export default async function InvitesPage() {
  const { id: userId, role } = await getUser();

  const invites = await sql<Invite[]>`
    SELECT * FROM invites
    WHERE created_by = ${userId}
    ORDER BY created_at DESC
  `;

  const [user] = await sql<User[]>`
    SELECT invite_quota, invites_sent FROM users
    WHERE id = ${userId}
  `;

  return (
    <InvitesClient
      initialInvites={invites}
      isAdmin={role === "admin"}
      inviteQuota={user.invite_quota}
      invitesSent={user.invites_sent}
    />
  );
}
