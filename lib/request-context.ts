import "server-only";
import { headers } from "next/headers";

export interface RequestUser {
  id: string;
  email: string;
  role: string;
}

export async function getUser(): Promise<RequestUser> {
  const h = await headers();
  const id = h.get("x-user-id");
  const email = h.get("x-user-email");

  if (!id || !email) {
    throw new Error("No user in request context. Authentication required.");
  }

  return { id, email, role: h.get("x-user-role") ?? "user" };
}

// Convenience helpers kept for routes that only need the id
export async function getUserId(): Promise<string> {
  return (await getUser()).id;
}

export async function getOptionalUserId(): Promise<string | null> {
  const h = await headers();
  return h.get("x-user-id");
}

export async function requireAdmin(): Promise<void> {
  const { role } = await getUser();
  if (role !== "admin") {
    throw new Error("Admin required");
  }
}
