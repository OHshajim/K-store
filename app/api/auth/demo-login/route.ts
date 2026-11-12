import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const role: "admin" | "customer" =
      body.role === "admin" ? "admin" : "customer";
    const email: string =
      body.email ||
      (role === "admin" ? "admin@kstore.com" : "demo.collector@kstore.com");
    const name: string =
      role === "admin" ? "Kstore Studio Architect" : "Elin Lindqvist";
    const userId: string =
      role === "admin" ? "demo-admin-id" : "demo-customer-id";

    const sessionPayload = JSON.stringify({
      role,
      email,
      name,
      userId,
    });

    const cookieStore = await cookies();
    cookieStore.set("kstore_session", sessionPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    const targetUrl =
      role === "admin" ? "/admin" : "/account";

    return NextResponse.json({
      success: true,
      role,
      redirect: targetUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Authentication error",
      },
      { status: 500 }
    );
  }
}

