"use client";

import { useState } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

/**
 * Uploads one image to a storage bucket (admin-only write) and reports back
 * the public URL. Shared by the product form and the banner form.
 */
export function ImageUploadInput({
  bucket,
  label,
  value,
  onChange,
}: {
  bucket: "product-images" | "banners";
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
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
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Upload failed",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <VStack gap={2}>
      <Text type="label">{label}</Text>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Upload preview"
          className="max-w-60 rounded-lg"
        />
      )}
      <label className="w-fit">
        <Button
          label={value ? "Replace image" : "Upload image"}
          variant="secondary"
          size="sm"
          icon={<ArrowUpTrayIcon />}
          isLoading={isUploading}
          onClick={(event) => {
            event.preventDefault();
            document.getElementById(`upload-${bucket}-${label}`)?.click();
          }}
        />
        <input
          id={`upload-${bucket}-${label}`}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>
      {error && <Banner status="error" title="Upload failed" description={error} />}
    </VStack>
  );
}
