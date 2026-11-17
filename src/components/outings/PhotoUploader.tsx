"use client";

import { useEffect, useState } from "react";
import { Button } from "@parkerburgess/wandering-parker-ui";
import { useRouter } from "next/navigation";

const UPLOAD_FAILED_MESSAGE = "Couldn't upload the photo. Please try again.";

async function readUploadError(response: Response): Promise<string> {
  try {
    const body: { error?: string } = await response.json();
    return body.error ?? UPLOAD_FAILED_MESSAGE;
  } catch {
    return UPLOAD_FAILED_MESSAGE;
  }
}

export function PhotoUploader({ outingId }: { outingId: string }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  // Each preview is a blob: URL that holds the whole image in memory until
  // it is revoked. Free the old one whenever it's replaced or we unmount.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setError("");
    }
  }

  function handleCaptionChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCaption(e.target.value);
  }

  function resetForm() {
    setFile(null);
    setPreview(null);
    setCaption("");
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("outingId", outingId);
    if (caption) formData.append("caption", caption);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        resetForm();
        router.refresh();
      } else {
        setError(await readUploadError(response));
      }
    } catch {
      setError(UPLOAD_FAILED_MESSAGE);
    } finally {
      setUploading(false);
    }
  }

  // #region Tailwind utility consts
  const containerCls = "space-y-3";
  const headingCls = "font-semibold";
  const fileInputCls =
    "block w-full text-sm text-gray-500 " +
    "file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 " +
    "file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 " +
    "file:cursor-pointer hover:file:bg-blue-100";
  const previewAreaCls = "space-y-2";
  const previewImageCls = "rounded-lg max-h-48 object-cover";
  const captionInputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500";
  const errorTextCls = "text-sm text-red-700";
  // #endregion

  return (
    <div className={containerCls}>
      <h3 className={headingCls}>Add Photo</h3>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic"
        onChange={handleFileChange}
        className={fileInputCls}
      />
      {preview && (
        <div className={previewAreaCls}>
          {/* Local blob: URL from the file picker; next/image has nothing to optimize here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className={previewImageCls} />
          <input
            type="text"
            placeholder="Caption (optional)"
            maxLength={500}
            value={caption}
            onChange={handleCaptionChange}
            className={captionInputCls}
          />
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </div>
      )}
      {error && <p className={errorTextCls}>{error}</p>}
    </div>
  );
}
