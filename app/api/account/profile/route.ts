import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().max(30).optional().nullable(),
  avatar_url: z.string().optional().nullable(),
});

export async function PATCH(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Sign in first" }, { status: 401 });
    }

    const body = bodySchema.parse(await request.json());

    // Update Supabase profiles table for valid UUID user profile
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        profile.id,
      );

    if (isUuid) {
      try {
        const admin = createAdminClient();
        const updateData: Record<string, unknown> = {
          full_name: body.full_name,
          phone: body.phone || null,
          updated_at: new Date().toISOString(),
        };
        if (body.avatar_url !== undefined) {
          updateData.avatar_url = body.avatar_url;
        }

        await admin
          .from("profiles")
          .update(updateData)
          .eq("id", profile.id);
      } catch (dbErr) {
        console.warn("Could not update Supabase profiles table:", dbErr);
      }
    }

    return NextResponse.json({ ok: true, name: body.full_name });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message || "Invalid input"
        : error instanceof Error
          ? error.message
          : "Unable to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
