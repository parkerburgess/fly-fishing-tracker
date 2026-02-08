"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface Photo {
  id: string;
  filename: string;
  caption: string | null;
}

export function PhotoUploader({ outingId }: { outingId: string }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("outingId", outingId);
    if (caption) formData.append("caption", caption);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setFile(null);
      setPreview(null);
      setCaption("");
      router.refresh();
    }

    setUploading(false);
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Add Photo</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {preview && (
        <div className="space-y-2">
          <img src={preview} alt="Preview" className="rounded-lg max-h-48 object-cover" />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Photo"}
          </Button>
        </div>
      )}
    </div>
  );
}
