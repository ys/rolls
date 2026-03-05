import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";
import { sql } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
  const { id } = await params;

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

  const origin = new URL(request.url).origin;
  const contactSheetUrl = `${origin}/api/rolls/${id}/contact-sheet`;
  await sql`UPDATE rolls SET contact_sheet_url = ${contactSheetUrl} WHERE roll_number = ${id}`;

  return NextResponse.json({ contact_sheet_url: contactSheetUrl });
}
