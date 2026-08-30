import { cookies } from "next/headers";
import { DEMO_ADMIN, DEMO_PROFILE } from "@/lib/data/demo";
import type { Profile } from "@/lib/types";

export const DEMO_SESSION_COOKIE = "kstore-demo-session";

export async function getDemoProfile(): Promise<Profile | null> {
  const jar = await cookies();
  const value = jar.get(DEMO_SESSION_COOKIE)?.value;
  if (value === "admin") return DEMO_ADMIN;
  if (value === "customer") return DEMO_PROFILE;
  return null;
}

export function demoProfileFromRole(role: "customer" | "admin"): Profile {
  return role === "admin" ? DEMO_ADMIN : DEMO_PROFILE;
}
