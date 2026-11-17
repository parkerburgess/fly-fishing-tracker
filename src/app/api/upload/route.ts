import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@parkerburgess/wandering-parker-server";
import dal from "@/lib/dal";
import { OutingNotFoundError } from "@/lib/dal/errors";
import { badRequest, forbidden } from "@/lib/api-responses";
import {
  MAX_CAPTION_LENGTH,
  MAX_PHOTO_BYTES,
  deletePhotoFile,
  extensionForMimeType,
  savePhoto,
} from "@/lib/photo-storage";

export async function POST(req: NextRequest) {
  const userId = await getUserId();

  const formData = await req.formData();
  const file = formData.get("file");
  const outingIdRaw = formData.get("outingId");
  const captionRaw = formData.get("caption");

  if (!(file instanceof File) || typeof outingIdRaw !== "string") {
    return badRequest("File and outingId required");
  }

  const outingId = Number(outingIdRaw);
  if (!Number.isInteger(outingId)) {
    return badRequest("Invalid outingId");
  }

  const caption = typeof captionRaw === "string" && captionRaw.length > 0 ? captionRaw : null;
  if (caption !== null && caption.length > MAX_CAPTION_LENGTH) {
    return badRequest(`Caption must be ${MAX_CAPTION_LENGTH} characters or fewer`);
  }

  const extension = extensionForMimeType(file.type);
  if (!extension) {
    return badRequest("Only JPEG, PNG, WebP, GIF or HEIC images can be uploaded");
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return badRequest("Photos must be 10 MB or smaller");
  }

  // Check ownership before anything touches the disk, so a request against
  // someone else's outing can't leave an orphaned file behind.
  if (!(await dal.ownsOuting(userId, outingId))) {
    return forbidden("Not authorized");
  }

  const filename = await savePhoto(new Uint8Array(await file.arrayBuffer()), extension);

  try {
    const photo = await dal.addPhoto(userId, outingId, { filename, caption });
    return NextResponse.json({ photo });
  } catch (error) {
    await deletePhotoFile(filename);
    if (error instanceof OutingNotFoundError) {
      return forbidden("Not authorized");
    }
    throw error;
  }
}
