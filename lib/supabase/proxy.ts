import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isAuthRoute = path.startsWith("/login");
  const isAccountRoute = path.startsWith("/account");

  // 1. Check for kstore_session fast-access cookie
  const demoCookie = request.cookies.get("kstore_session")?.value;
  let demoSession: { role?: string; email?: string } | null = null;
  if (demoCookie) {
    try {
      demoSession = JSON.parse(demoCookie);
    } catch {}
  }

  if (demoSession) {
    if (demoSession.role === "admin") {
      if (isAuthRoute) {
        const nextParam = request.nextUrl.searchParams.get("next");
        const url = request.nextUrl.clone();
        url.pathname =
          nextParam && nextParam.startsWith("/") ? nextParam : "/admin";
        url.searchParams.delete("next");
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    if (demoSession.role === "customer") {
      if (isAdminRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      if (isAuthRoute) {
        const nextParam = request.nextUrl.searchParams.get("next");
        const url = request.nextUrl.clone();
        url.pathname =
          nextParam &&
          nextParam.startsWith("/") &&
          !nextParam.startsWith("/admin")
            ? nextParam
            : "/account";
        url.searchParams.delete("next");
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }
  }

  if (!hasSupabaseEnv()) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
  );

  if (!hasAuthCookie) {
    if (isAdminRoute || isAccountRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isAdminRoute) {
      if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", path);
        return NextResponse.redirect(url);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    if (isAccountRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/account";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.warn(
      "Supabase session update bypassed:",
      err instanceof Error ? err.message : err
    );
  }

  return supabaseResponse;
}
