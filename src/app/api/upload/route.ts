import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const outingId = formData.get("outingId") as string | null;
  const caption = formData.get("caption") as string | null;

  if (!file || !outingId) {
    return NextResponse.json({ error: "File and outingId required" }, { status: 400 });
  }

  const outing = await prisma.outing.findUnique({ where: { id: outingId } });
  if (!outing || outing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

  await writeFile(uploadPath, bytes);

  const photo = await prisma.photo.create({
    data: { outingId, filename, caption },
  });

  return NextResponse.json({ photo });
}
