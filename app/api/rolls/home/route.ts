import { NextResponse } from "next/server";
import { getUserId } from "@/lib/request-context";
import { getRollsWithDetails } from "@/lib/queries";

export async function GET() {
  const userId = await getUserId();
  const rolls = await getRollsWithDetails(userId, false);
  return NextResponse.json({ rolls });
}
