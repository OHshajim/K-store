import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/auth/otp";
import { DEMO_SESSION_COOKIE } from "@/lib/auth/demo-session";
import { isDemoMode } from "@/lib/env";

const bodySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(12),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const result = await verifyOtp(body.email, body.code);

    if (isDemoMode() || result.demo) {
      const role =
        body.email.toLowerCase() === "admin@kstore.local"
          ? "admin"
          : "customer";
      const response = NextResponse.json({
        ok: true,
        demo: true,
        role,
      });
      response.cookies.set(DEMO_SESSION_COOKIE, role, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    return NextResponse.json({
      ok: true,
      hashedToken: result.hashedToken,
      email: result.email,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to verify code";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
