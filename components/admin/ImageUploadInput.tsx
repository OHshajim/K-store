"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

/**
 * Enhanced ImageUploadInput supporting both:
 * 1. Direct file upload (with Supabase Storage & local fallback + full .ico/.svg support)
 * 2. Direct URL input (for users hosting images externally on their own CDN or image hosting)
 */
export function ImageUploadInput({
  bucket,
  label,
  value,
  onChange,
}: {
  bucket: "product-images" | "banners" | "products";
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">(value?.startsWith("http") ? "url" : "upload");
  const [inputUrl, setInputUrl] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onChange(data.url);
      setInputUrl(data.url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  function handleUrlChange(newUrl: string) {
    setInputUrl(newUrl);
    onChange(newUrl.trim());
    setError(null);
  }

  function handleClear() {
    onChange("");
    setInputUrl("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-[#1A1C18]">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-[#FAF9F6] border border-[#1A1C18]/10 rounded-lg p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              mode === "upload"
                ? "bg-[#1A1C18] text-white shadow-2xs"
                : "text-stone-500 hover:text-[#1A1C18]"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              mode === "url"
                ? "bg-[#1A1C18] text-white shadow-2xs"
                : "text-stone-500 hover:text-[#1A1C18]"
            }`}
          >
            Paste URL
          </button>
        </div>
      </div>

      {/* Mode 1: File Upload */}
      {mode === "upload" && (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/ico,image/gif,image/*,.ico,.png,.jpg,.jpeg,.webp,.svg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileUpload(file);
            }}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] hover:bg-[#FAF9F6] hover:border-[#1A1C18]/30 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4 text-[#B78E69]" />
            <span>{isUploading ? "Uploading to Cloud..." : value ? "Replace File" : "Choose File to Upload"}</span>
          </button>

          {value && (
            <span className="text-[11px] font-mono text-[#8A927A] truncate max-w-[280px]">
              {value}
            </span>
          )}
        </div>
      )}

      {/* Mode 2: Direct URL Input */}
      {mode === "url" && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
            <LinkIcon className="w-4 h-4" />
          </div>
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://... (CDN, Supabase, or external image URL)"
            className="w-full pl-9 pr-24 py-2 rounded-xl border border-[#1A1C18]/15 text-xs text-[#1A1C18] focus:outline-none focus:ring-2 focus:ring-[#1A1C18] font-mono"
          />
          {inputUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-700 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Preview Card */}
      {value && (
        <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#1A1C18]/10 flex items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl bg-white border border-[#1A1C18]/10 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Selected asset preview"
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/icons/icon-192.png";
                }}
              />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A927A] block">
                Active Asset URL
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono font-medium text-[#1A1C18] hover:text-[#B78E69] transition-colors truncate block max-w-sm flex items-center gap-1"
              >
                <span className="truncate">{value}</span>
                <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
