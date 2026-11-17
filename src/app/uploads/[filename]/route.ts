import { NextRequest, NextResponse } from "next/server";
import { notFound } from "@/lib/api-responses";
import { readPhoto } from "@/lib/photo-storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const photo = await readPhoto(filename);

  if (!photo) {
    return notFound("Photo not found");
  }

  // nosniff + a sandboxing CSP make sure the browser only ever treats the
  // bytes as an image, even if an upload lied about its type.
  return new NextResponse(photo.bytes, {
    headers: {
      "Content-Type": photo.mimeType,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
