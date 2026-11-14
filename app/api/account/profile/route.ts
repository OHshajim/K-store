import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/data/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().max(30).optional().nullable(),
});

export async function PATCH(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Sign in first" }, { status: 401 });
    }

    const body = bodySchema.parse(await request.json());

    // 1. If signed in via demo session cookie, update the session payload
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("kstore_session")?.value;
    if (demoCookie) {
      try {
        const parsed = JSON.parse(demoCookie);
        parsed.name = body.full_name;
        parsed.phone = body.phone || null;
        cookieStore.set("kstore_session", JSON.stringify(parsed), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      } catch {}
    }

    // 2. If valid UUID profile ID exists in Supabase, update database
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        profile.id,
      );

    if (isUuid) {
      try {
        const admin = createAdminClient();
        await admin
          .from("profiles")
          .update({
            full_name: body.full_name,
            phone: body.phone || null,
            updated_at: new Date().toISOString(),
          })
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
