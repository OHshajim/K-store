import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAndSendOtp, type OtpIntent } from "@/lib/data/otp";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  intent: z.enum(["forgot_password", "password_change"]).default("forgot_password"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, intent } = bodySchema.parse(json);

    const result = await generateAndSendOtp(email, intent as OtpIntent);

    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message || "Invalid input data"
        : err instanceof Error
        ? err.message
        : "Failed to dispatch verification code";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
