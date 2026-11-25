import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdminProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAdminProfile();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const requestedBucket = formData.get("bucket") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/svg+xml",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "image/ico",
      "image/gif",
    ];

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const isKnownExt = ["ico", "png", "jpg", "jpeg", "webp", "avif", "svg", "gif"].includes(ext);

    if (!validTypes.includes(file.type) && !isKnownExt) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats: ICO, PNG, JPEG, WebP, AVIF, SVG, GIF" },
        { status: 400 },
      );
    }

    const contentType = file.type || (ext === "ico" ? "image/x-icon" : `image/${ext}`);

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file exceeds 10MB limit" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${randomUUID()}.${ext}`;

    try {
      const admin = createAdminClient();
      const primaryBucket = requestedBucket === "banners" ? "products" : "products";

      let uploadData;
      let uploadError;
      let activeBucket = primaryBucket;

      const res1 = await admin.storage
        .from(primaryBucket)
        .upload(filename, buffer, {
          contentType,
          upsert: true,
        });

      uploadData = res1.data;
      uploadError = res1.error;

      if (uploadError) {
        activeBucket = "product-images";
        const res2 = await admin.storage
          .from("product-images")
          .upload(filename, buffer, {
            contentType,
            upsert: true,
          });
        uploadData = res2.data;
        uploadError = res2.error;
      }

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = admin.storage
          .from(activeBucket)
          .getPublicUrl(filename);

        return NextResponse.json({
          url: publicUrlData.publicUrl,
          filename,
          bucket: activeBucket,
          success: true,
          storage: "supabase",
        });
      }
    } catch (storageErr) {
      console.warn("Supabase storage upload unavailable, saving to local public/uploads:", storageErr);
    }

    // Local filesystem fallback for offline/dev environments
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      bucket: "local",
      success: true,
      storage: "local",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    const status = message.includes("Admin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
