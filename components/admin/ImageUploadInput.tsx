"use client";

import { useState } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";

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
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
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
