import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type SessionPayload = {
  role: "admin" | "customer";
  email: string;
  name: string;
  userId: string;
};

async function getDemoSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("kstore_session")?.value;
    if (!raw) return null;
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return user;
  } catch {}

  const demoSession = await getDemoSession();
  if (demoSession) {
    return {
      id: demoSession.userId,
      email: demoSession.email,
      user_metadata: { full_name: demoSession.name },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as {
      id: string;
      email?: string;
      user_metadata: Record<string, unknown>;
    };
  }

  return null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) return data as Profile;
    }
  } catch {}

  const demoSession = await getDemoSession();
  if (demoSession) {
    return {
      id: demoSession.userId,
      email: demoSession.email,
      role: demoSession.role,
      full_name: demoSession.name,
      phone:
        demoSession.role === "admin"
          ? "+1 (800) 555-0199"
          : "+46 8 123 4567",
      avatar_url: null,
    };
  }

  return null;
}

export async function requireAdminProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Admin access required");
  }
  return profile;
}
