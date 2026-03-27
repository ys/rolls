import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2";
import { sql } from "@/lib/db";
import { getUserId } from "@/lib/request-context";
import type { ContactSheetUploadResponse, RollIdPathParams } from "@/app/api/_schemas/rolls";
import type { ErrorResponse } from "@/app/api/_schemas/common";

/**
 * Get a roll contact sheet
 * @description Returns the roll contact sheet image as `image/webp`.
 * @auth bearer
 * @pathParams RollIdPathParams
 * @response 200:unknown
 * @add 404:ErrorResponse
 * @openapi
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: uuid } = (await params) satisfies RollIdPathParams;

  // Verify user owns this roll before serving the image
  const [roll] = await sql<{ roll_number: string }[]>`
    SELECT roll_number FROM rolls WHERE uuid = ${uuid} AND user_id = ${userId}
  `;

  if (!roll) {
    return NextResponse.json({ error: "Not found" } satisfies ErrorResponse, { status: 404 });
  }

  const { roll_number } = roll;

  try {
    const obj = await r2.send(new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: `${roll_number}.webp`,
    }));

    const stream = obj.Body?.transformToWebStream();
    if (!stream) {
      return NextResponse.json({ error: "Not found" } satisfies ErrorResponse, { status: 404 });
    }

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" } satisfies ErrorResponse, { status: 404 });
  }
}

/**
 * Upload a roll contact sheet
 * @description Uploads a raw webp payload (request body is the file bytes), stores it in R2, and updates the roll.
 * @auth bearer
 * @pathParams RollIdPathParams
 * @contentType image/webp
 * @response ContactSheetUploadResponse
 * @add 400:ErrorResponse
 * @add 404:ErrorResponse
 * @openapi
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  const { id: uuid } = (await params) satisfies RollIdPathParams;

  // Verify user owns this roll before uploading
  const [roll] = await sql<{ roll_number: string }[]>`
    SELECT roll_number FROM rolls WHERE uuid = ${uuid} AND user_id = ${userId}
  `;

  if (!roll) {
    return NextResponse.json({ error: "Not found" } satisfies ErrorResponse, { status: 404 });
  }

  const { roll_number } = roll;

  const body = await request.arrayBuffer();
  if (!body.byteLength) {
    return NextResponse.json({ error: "Empty body" } satisfies ErrorResponse, { status: 400 });
  }

  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
  if (body.byteLength > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 20 MB)" } satisfies ErrorResponse, { status: 413 });
  }

  // Validate WebP magic bytes: RIFF....WEBP
  const bytes = new Uint8Array(body);
  const isWebP =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && // RIFF
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;  // WEBP
  if (!isWebP) {
    return NextResponse.json({ error: "File must be a WebP image" } satisfies ErrorResponse, { status: 400 });
  }

  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: `${roll_number}.webp`,
    Body: new Uint8Array(body),
    ContentType: "image/webp",
  }));

  // Prefer a direct public R2 URL if the bucket has public access configured,
  // otherwise fall back to the app-proxied URL (using APP_URL env or request origin).
  const contactSheetUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${roll_number}.webp`
    : `${process.env.APP_URL ?? new URL(request.url).origin}/api/rolls/${uuid}/contact-sheet`;
  await sql`
    UPDATE rolls
    SET contact_sheet_url = ${contactSheetUrl}
    WHERE uuid = ${uuid} AND user_id = ${userId}
  `;

  return NextResponse.json({ contact_sheet_url: contactSheetUrl } satisfies ContactSheetUploadResponse);
}
