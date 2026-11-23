import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyAndConsumeOtp, type OtpIntent } from "@/lib/data/otp";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    email: z.string().email("Please provide a valid email address"),
    otp: z.string().optional(),
    otpCode: z.string().optional(),
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    intent: z.enum(["forgot_password", "password_change"]).default("forgot_password"),
  })
  .transform((data) => ({
    ...data,
    otp: (data.otp || data.otpCode || "").trim(),
  }))
  .refine((data) => data.otp.length === 6, {
    message: "Verification code must be exactly 6 digits",
    path: ["otp"],
  });

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, otp, newPassword, intent } = bodySchema.parse(json);

    // 1. Validate the 6-digit OTP
    const isValid = await verifyAndConsumeOtp(email, otp, intent as OtpIntent);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new code." },
        { status: 400 }
      );
    }

    // 2. Update Supabase Auth user credentials if Supabase user exists
    let updatedInSupabase = false;
    try {
      const admin = createAdminClient();
      const { data, error: listError } = await admin.auth.admin.listUsers();
      if (!listError && data?.users) {
        const targetUser = data.users.find(
          (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
        );
        if (targetUser) {
          const { error: updateError } = await admin.auth.admin.updateUserById(
            targetUser.id,
            { password: newPassword }
          );
          if (!updateError) {
            updatedInSupabase = true;
          } else {
            console.warn("[OTP] Supabase updateUserById error:", updateError);
          }
        }
      }
    } catch (err) {
      console.warn("[OTP] Supabase auth update error:", err);
    }

    // 3. If running in demo session, update the session password reference
    const cookieStore = await cookies();
    const demoCookie = cookieStore.get("kstore_session")?.value;
    if (demoCookie) {
      try {
        const parsed = JSON.parse(demoCookie);
        if (parsed.email?.toLowerCase() === email.trim().toLowerCase()) {
          parsed.passwordUpdated = true;
          cookieStore.set("kstore_session", JSON.stringify(parsed), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          });
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully updated. You may now sign in with your new credentials.",
      updatedInSupabase,
    });
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message || "Invalid input data"
        : err instanceof Error
        ? err.message
        : "Failed to reset password";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
