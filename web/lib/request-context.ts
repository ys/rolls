import "server-only";
import { headers } from "next/headers";

export async function getUserId(): Promise<string> {
  const headersData = await headers();
  const userId = headersData.get("x-user-id");

  if (!userId) {
    throw new Error("No user in request context. Authentication required.");
  }

  return userId;
}

export async function getUserEmail(): Promise<string> {
  const headersData = await headers();
  const userEmail = headersData.get("x-user-email");

  if (!userEmail) {
    throw new Error("No user email in request context. Authentication required.");
  }

  return userEmail;
}

export async function getOptionalUserId(): Promise<string | null> {
  const headersData = await headers();
  return headersData.get("x-user-id");
}
