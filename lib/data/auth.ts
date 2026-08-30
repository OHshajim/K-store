import { getDemoProfile } from "@/lib/auth/demo-session";
import { DEMO_ADMIN, DEMO_PROFILE } from "@/lib/data/demo";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentUser() {
  if (isDemoMode()) {
    const profile = await getDemoProfile();
    if (!profile) return null;
    return { id: profile.id, email: profile.email };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (isDemoMode()) return getDemoProfile();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as Profile | null) ?? null;
}

export async function requireAdminProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Admin access required");
  }
  return profile;
}

export function getDemoIdentities() {
  return { customer: DEMO_PROFILE, admin: DEMO_ADMIN };
}
