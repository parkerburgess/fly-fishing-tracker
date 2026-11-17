import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Photos live outside public/ because `next start` only serves files that
// were in public/ at build time. They are served by app/uploads/[filename]
// instead, which also puts them behind the proxy's auth check.
// The turbopackIgnore hints tell the build this is runtime data. Without them,
// Turbopack can't scope these dynamic paths and traces the whole project
// into the server output.
const UPLOAD_DIR =
  process.env.UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

function storedPhotoPath(filename: string): string {
  return path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, filename);
}

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const MAX_CAPTION_LENGTH = 500;

// The stored extension comes from this list, never from the uploaded file
// name, so a file can't be stored (and later served) as .html or .svg.
const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/heic": ".heic",
};

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
};

// Stored names are always <uuid><extension>. Anything else is rejected, so a
// request path can never point outside UPLOAD_DIR.
const STORED_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|heic)$/;

export interface StoredPhoto {
  // ArrayBuffer-backed (not ArrayBufferLike) so it is a valid response BodyInit.
  bytes: Uint8Array<ArrayBuffer>;
  mimeType: string;
}

export function extensionForMimeType(mimeType: string): string | null {
  return EXTENSION_BY_MIME_TYPE[mimeType] ?? null;
}

function isMissingFileError(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export async function savePhoto(bytes: Uint8Array, extension: string): Promise<string> {
  await mkdir(/*turbopackIgnore: true*/ UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}${extension}`;
  await writeFile(storedPhotoPath(filename), bytes);
  return filename;
}

export async function readPhoto(filename: string): Promise<StoredPhoto | null> {
  if (!STORED_FILENAME_PATTERN.test(filename)) return null;

  try {
    const fileContents = await readFile(storedPhotoPath(filename));
    return {
      bytes: new Uint8Array(fileContents),
      mimeType: MIME_TYPE_BY_EXTENSION[path.extname(filename)],
    };
  } catch (error) {
    if (isMissingFileError(error)) return null;
    throw error;
  }
}

// A file that is already gone counts as deleted.
export async function deletePhotoFile(filename: string): Promise<void> {
  if (!STORED_FILENAME_PATTERN.test(filename)) return;

  try {
    await unlink(storedPhotoPath(filename));
  } catch (error) {
    if (!isMissingFileError(error)) throw error;
  }
}
