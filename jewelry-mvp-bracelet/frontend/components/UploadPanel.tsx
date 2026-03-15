"use client";
import { useRef, useState } from "react";
import { useJewelryStore } from "@/store/useJewelryStore";
import { analyzeJewelry } from "@/lib/api";

export default function UploadPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setDesign = useJewelryStore((s) => s.setDesign);
  const setStatus = useJewelryStore((s) => s.setStatus);
  const setUpload = useJewelryStore((s) => s.setUpload);
  const status = useJewelryStore((s) => s.status);
  const isLoading = status === "uploading" || status === "analyzing";

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    setError(null);
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);
    setUpload(blobUrl, file.name);
    setStatus("analyzing");
    try {
      const resp = await analyzeJewelry(file);
      setDesign(resp.design);
    } catch (e: unknown) {
      setStatus("error", e instanceof Error ? e.message : "Failed to analyze image");
      setError(e instanceof Error ? e.message : "Failed to analyze image");
    }
  }

  return (
    <div className="gem-panel p-4">
      <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Upload Image</h2>

      <div
        className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-amber-500 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded object-cover" />
        ) : (
          <div className="text-gray-500 py-4">
            <div className="text-3xl mb-2">+</div>
            <p className="text-sm">Drop image or click to upload</p>
            <p className="text-xs mt-1 text-gray-600">JPG, PNG, WEBP</p>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {isLoading && <p className="text-amber-300 text-xs mt-2 animate-pulse">Analyzing with AI...</p>}
    </div>
  );
}
