import { sql } from "@/lib/db";
import type { Invite } from "@/lib/db";
import { getUser } from "@/lib/request-context";
import { redirect } from "next/navigation";
import InvitesClient from "./InvitesClient";

export const dynamic = "force-dynamic";

export default async function InvitesPage() {
  const { id: userId, role } = await getUser();

  if (role !== "admin") {
    redirect("/settings");
  }

  const invites = await sql<Invite[]>`
    SELECT * FROM invites
    WHERE created_by = ${userId}
    ORDER BY created_at DESC
  `;

  return <InvitesClient initialInvites={invites} />;
}
