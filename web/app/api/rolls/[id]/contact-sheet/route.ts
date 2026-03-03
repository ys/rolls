import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const SUPABASE_URL = process.env.DATABASE_SUPABASE_URL;
const SERVICE_KEY  = process.env.DATABASE_SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = "contact-sheets";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 500 });
  }

  const body = await request.arrayBuffer();
  if (!body.byteLength) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  const filename = `${id}.webp`;
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;

  const upload = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "image/webp",
      "x-upsert": "true",
    },
    body,
  });

  if (!upload.ok) {
    const err = await upload.text();
    return NextResponse.json({ error: `Upload failed: ${err}` }, { status: 500 });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;

  await sql`UPDATE rolls SET contact_sheet_url = ${publicUrl} WHERE roll_number = ${id}`;

  return NextResponse.json({ contact_sheet_url: publicUrl });
}
