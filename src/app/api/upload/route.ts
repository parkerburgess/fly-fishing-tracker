import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import dal from "@/lib/dal";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const userId = await getUserId();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const outingIdRaw = formData.get("outingId") as string | null;
  const caption = formData.get("caption") as string | null;

  if (!file || !outingIdRaw) {
    return NextResponse.json({ error: "File and outingId required" }, { status: 400 });
  }

  const outingId = Number(outingIdRaw);
  if (!Number.isInteger(outingId)) {
    return NextResponse.json({ error: "Invalid outingId" }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

  await writeFile(uploadPath, bytes);

  try {
    const photo = await dal.addPhoto(userId, outingId, { filename, caption });
    return NextResponse.json({ photo });
  } catch {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
}
