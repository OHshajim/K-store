import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { requireAdminProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    await requireAdminProfile();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats: JPEG, PNG, WebP, AVIF, SVG" },
        { status: 400 },
      );
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image file exceeds 10MB limit" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${randomUUID()}.${ext}`;

    // 1. Try uploading to Supabase Storage if configured
    try {
      const admin = createAdminClient();
      const { data: uploadData, error: uploadError } = await admin.storage
        .from("products")
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = admin.storage
          .from("products")
          .getPublicUrl(filename);

        return NextResponse.json({
          url: publicUrlData.publicUrl,
          filename,
          success: true,
          storage: "supabase",
        });
      }
    } catch {
      // Supabase storage unavailable or bucket not yet created, fall back to local public upload
    }

    // 2. Fallback: Save to public/uploads directory for offline development & testing
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const localFilePath = join(uploadDir, filename);
    await writeFile(localFilePath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      success: true,
      storage: "local",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    const status = message.includes("Admin") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

