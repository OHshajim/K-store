import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Password-reset email lands here with a one-time code. Exchanging it signs
// the user in; they then set the new password from Account → Security.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/account?reset=1`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=reset`);
}
