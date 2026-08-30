import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE } from "@/lib/auth/demo-session";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  if (!isDemoMode()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
