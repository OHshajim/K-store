import { NextResponse } from "next/server";
import { z } from "zod";
import { issueOtp } from "@/lib/auth/otp";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const result = await issueOtp(body.email);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to send code";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
