import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate mime type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
    ];

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const isKnownExt = ["png", "jpg", "jpeg", "webp", "avif", "gif"].includes(ext);

    if (!validTypes.includes(file.type) && !isKnownExt) {
      return NextResponse.json(
        { error: "Invalid image format. Supported formats: PNG, JPEG, WebP, AVIF, GIF" },
        { status: 400 }
      );
    }

    // Validate size (max 5MB for profile avatars)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Profile picture exceeds maximum allowed size of 5MB" },
        { status: 400 }
      );
    }

    const contentType = file.type || `image/${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `avatar_${profile.id.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}.${ext}`;

    let avatarUrl = "";
    let uploadedToCloud = false;

    // 1. Attempt upload to Supabase Storage ('avatars' or fallback 'products' bucket)
    const admin = createAdminClient();
    try {
      let res = await admin.storage
        .from("avatars")
        .upload(filename, buffer, {
          contentType,
          upsert: true,
        });

      // If 'avatars' bucket does not exist, try to auto-create it
      if (res.error && res.error.message?.toLowerCase().includes("not found")) {
        try {
          await admin.storage.createBucket("avatars", { public: true });
          res = await admin.storage
            .from("avatars")
            .upload(filename, buffer, {
              contentType,
              upsert: true,
            });
        } catch {}
      }

      if (!res.error) {
        const { data } = admin.storage.from("avatars").getPublicUrl(filename);
        avatarUrl = data.publicUrl;
        uploadedToCloud = true;
      } else {
        // Fallback to existing 'products' bucket under avatars/ folder
        const res2 = await admin.storage
          .from("products")
          .upload(`avatars/${filename}`, buffer, {
            contentType,
            upsert: true,
          });
        if (!res2.error) {
          const { data } = admin.storage.from("products").getPublicUrl(`avatars/${filename}`);
          avatarUrl = data.publicUrl;
          uploadedToCloud = true;
        }
      }
    } catch (cloudErr) {
      console.warn("[Avatar] Supabase Storage upload exception:", cloudErr);
    }

    if (!uploadedToCloud) {
      throw new Error("Unable to upload image to Supabase Storage. Please verify the 'avatars' or 'products' bucket exists in your Supabase Dashboard.");
    }

    // 3. Update database profiles table if profile is valid UUID
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        profile.id
      );

    if (isUuid) {
      try {
        const admin = createAdminClient();
        await admin
          .from("profiles")
          .update({
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);
      } catch (dbErr) {
        console.warn("[Avatar] Database update error:", dbErr);
      }
    }

    // 4. Update demo session cookie if logged in via demo session
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("kstore_session")?.value;
    if (demoCookie) {
      try {
        const parsed = JSON.parse(demoCookie);
        parsed.avatar_url = avatarUrl;
        cookieStore.set("kstore_session", JSON.stringify(parsed), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      avatar_url: avatarUrl,
      message: "Profile picture uploaded successfully.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload avatar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // 1. Remove from database
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        profile.id
      );

    if (isUuid) {
      try {
        const admin = createAdminClient();
        await admin
          .from("profiles")
          .update({
            avatar_url: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);
      } catch {}
    }

    // 2. Remove from session cookie
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("kstore_session")?.value;
    if (demoCookie) {
      try {
        const parsed = JSON.parse(demoCookie);
        parsed.avatar_url = null;
        cookieStore.set("kstore_session", JSON.stringify(parsed), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      message: "Profile picture removed successfully.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to remove avatar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
