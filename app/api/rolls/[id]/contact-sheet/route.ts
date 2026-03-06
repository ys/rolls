import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;

  // Verify user owns this roll before serving the image
  const [roll] = await sql<{ roll_number: string }[]>`
    SELECT roll_number FROM rolls WHERE roll_number = ${id} AND user_id = ${userId}
  `;

  if (!roll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const obj = await r2.send(new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: `${id}.webp`,
    }));

    const stream = obj.Body?.transformToWebStream();
    if (!stream) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id } = await params;

  // Verify user owns this roll before uploading
  const [roll] = await sql<{ roll_number: string }[]>`
    SELECT roll_number FROM rolls WHERE roll_number = ${id} AND user_id = ${userId}
  `;

  if (!roll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.arrayBuffer();
  if (!body.byteLength) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 });
  }

  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: `${id}.webp`,
    Body: new Uint8Array(body),
    ContentType: "image/webp",
  }));

  // Prefer a direct public R2 URL if the bucket has public access configured,
  // otherwise fall back to the app-proxied URL (using APP_URL env or request origin).
  const contactSheetUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${id}.webp`
    : `${process.env.APP_URL ?? new URL(request.url).origin}/api/rolls/${id}/contact-sheet`;
  await sql`
    UPDATE rolls
    SET contact_sheet_url = ${contactSheetUrl}
    WHERE roll_number = ${id} AND user_id = ${userId}
  `;

  return NextResponse.json({ contact_sheet_url: contactSheetUrl });
}
