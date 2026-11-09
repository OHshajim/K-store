import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  full_name: z.string().min(2).max(80),
  phone: z.string().max(30).optional(),
});

export async function PATCH(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Sign in first" }, { status: 401 });
    }

    const body = bodySchema.parse(await request.json());
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: body.full_name,
        phone: body.phone || null,
      })
      .eq("id", profile.id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update profile";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
