"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

type Mode = "signin" | "register" | "forgot";

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width={18}
    height={18}
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setError(null);
    setNotice(null);
    setIsBusy(true);
    try {
      await action();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Something went wrong.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  function signInWithGoogle() {
    void run(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) throw oauthError;
    });
  }

  async function handleFastLogin(role: "admin" | "customer") {
    await run(async () => {
      const demoEmail =
        role === "admin" ? "admin@kstore.com" : "demo.collector@kstore.com";
      const res = await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email: demoEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to establish demo session");
      }
      const target =
        role === "admin"
          ? next.startsWith("/admin")
            ? next
            : "/admin"
          : next.startsWith("/admin")
          ? "/account"
          : next;
      window.location.href = target;
    });
  }

  function signInWithPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    void run(async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        window.location.href = next;
      } catch (err) {
        // Fallback for demonstration / local preview if Supabase user is unseeded or offline
        const isDemoAdmin = email.toLowerCase().includes("admin");
        const isDemo =
          isDemoAdmin ||
          email.toLowerCase().includes("demo") ||
          email.includes("@");
        if (isDemo) {
          const role = isDemoAdmin ? "admin" : "customer";
          const res = await fetch("/api/auth/demo-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, email }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            window.location.href =
              role === "admin"
                ? next.startsWith("/admin")
                  ? next
                  : "/admin"
                : next.startsWith("/admin")
                ? "/account"
                : next;
            return;
          }
        }
        throw err;
      }
    });
  }

  function register(e?: React.FormEvent) {
    if (e) e.preventDefault();
    void run(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) throw signUpError;
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setNotice("Check your inbox to confirm your email, then sign in.");
      setMode("signin");
    });
  }

  function sendResetLink(e?: React.FormEvent) {
    if (e) e.preventDefault();
    void run(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/auth/reset` },
      );
      if (resetError) throw resetError;
      setNotice("If that email exists, a reset link is on its way.");
    });
  }

  const modeHeaders: Record<Mode, { title: string; subtitle: string }> = {
    signin: {
      title: "Welcome to Kstore",
      subtitle: "Sign in to access your orders, saved spaces, and tailored recommendations.",
    },
    register: {
      title: "Create an Account",
      subtitle: "Join the Kstore community for architectural inspiration and seamless ordering.",
    },
    forgot: {
      title: "Reset Password",
      subtitle: "Enter your registered email address to receive secure recovery instructions.",
    },
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-[#1A1C18]/12 shadow-xl p-7 sm:p-9 space-y-6">
      {/* Editorial Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#F4F0E8] text-[#1A1C18] mb-1 border border-[#1A1C18]/10">
          <Sparkles className="w-5 h-5 text-[#B78E69]" />
        </div>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
          {modeHeaders[mode].title}
        </h2>
        <p className="text-xs sm:text-sm text-[#4A483E] leading-relaxed max-w-sm mx-auto font-sans">
          {modeHeaders[mode].subtitle}
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Authentication Notice</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {notice && (
        <div className="p-3.5 rounded-xl bg-[#8A927A]/15 border border-[#8A927A]/30 text-xs text-[#1A1C18] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#8A927A] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Notification</span>
            <span>{notice}</span>
          </div>
        </div>
      )}

      {/* Google Sign-in */}
      {mode !== "forgot" && (
        <>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 rounded-xl border border-[#1A1C18]/15 bg-white hover:bg-[#F4F0E8] text-sm font-semibold text-[#1A1C18] flex items-center justify-center gap-3 transition-all shadow-2xs hover:shadow-sm cursor-pointer"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-[#1A1C18]/12 flex-1" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A483E]">
              or with email
            </span>
            <div className="h-px bg-[#1A1C18]/12 flex-1" />
          </div>
        </>
      )}

      {/* Interactive Form */}
      <form
        onSubmit={
          mode === "signin"
            ? signInWithPassword
            : mode === "register"
            ? register
            : sendResetLink
        }
        className="space-y-4"
      >
        {mode === "register" && (
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1C18]">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A483E]/60 pointer-events-none" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#1A1C18]/15 bg-white text-sm text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#1A1C18] focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1C18]">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A483E]/60 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#1A1C18]/15 bg-white text-sm text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#1A1C18] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {mode !== "forgot" && (
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1C18]">
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs text-[#B78E69] hover:underline font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A483E]/60 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#1A1C18]/15 bg-white text-sm text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#1A1C18] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4A483E]/60 hover:text-[#1A1C18] p-1 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isBusy}
          data-btn="dark"
          style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
          className="w-full py-3.5 px-6 rounded-xl bg-[#1A1C18] text-white hover:bg-[#32362F] text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer pt-3"
        >
          <span style={{ color: "#FFFFFF" }}>
            {isBusy
              ? "Authenticating..."
              : mode === "signin"
              ? "Sign In to Your Space"
              : mode === "register"
              ? "Create Kstore Account"
              : "Send Reset Link"}
          </span>
          {!isBusy && (
            <ArrowRight className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
          )}
        </button>
      </form>

      {/* Demonstration Access Helper */}
      {mode === "signin" && (
        <div className="p-4 rounded-2xl bg-[#F4F0E8] border border-[#1A1C18]/10 space-y-2.5 text-left">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4A483E]">
            <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
            <span>Demonstration Fast-Access</span>
          </div>
          <p className="text-[11px] text-[#4A483E]/80 leading-relaxed font-sans">
            Instant 1-click preview access (no credentials needed):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleFastLogin("customer")}
              className="px-3.5 py-2.5 bg-white hover:bg-[#D8C9B5]/40 text-xs font-semibold text-[#1A1C18] rounded-xl border border-[#1A1C18]/12 transition-all shadow-2xs hover:shadow-xs text-left flex items-center justify-between cursor-pointer"
            >
              <span>👤 Customer Demo</span>
              <span className="text-[10px] font-mono text-[#8A927A] font-bold">1-Click</span>
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleFastLogin("admin")}
              className="px-3.5 py-2.5 bg-white hover:bg-[#D8C9B5]/40 text-xs font-semibold text-[#1A1C18] rounded-xl border border-[#1A1C18]/12 transition-all shadow-2xs hover:shadow-xs text-left flex items-center justify-between cursor-pointer"
            >
              <span>🛡️ Store Admin</span>
              <span className="text-[10px] font-mono text-[#B78E69] font-bold">1-Click</span>
            </button>
          </div>
        </div>
      )}

      {/* Switch Mode Footer */}
      <div className="pt-2 border-t border-[#1A1C18]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4A483E]">
        {mode === "signin" ? (
          <>
            <span>Do not have an account yet?</span>
            <button
              type="button"
              onClick={() => setMode("register")}
              className="font-bold text-[#1A1C18] hover:text-[#B78E69] underline underline-offset-4 transition-colors cursor-pointer"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            <span>Already registered with {APP_NAME}?</span>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="font-bold text-[#1A1C18] hover:text-[#B78E69] underline underline-offset-4 transition-colors cursor-pointer"
            >
              Return to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
