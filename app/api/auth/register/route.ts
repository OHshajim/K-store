import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  fullName: z.string().trim().min(1, "Please provide your full name"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, password, fullName } = registerSchema.parse(json);

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      const status =
        error.status && error.status >= 400 && error.status < 500
          ? error.status
          : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
    });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message || "Invalid registration details"
        : err instanceof Error
        ? err.message
        : "Failed to create account";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
