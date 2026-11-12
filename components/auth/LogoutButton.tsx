"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export function LogoutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {}
        window.location.href = "/";
      }}
      className={
        className ||
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
      }
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4A483E]" />
      ) : (
        <LogOut className="w-3.5 h-3.5 text-[#4A483E]" />
      )}
      <span>{loading ? "Signing out…" : "Sign out"}</span>
    </button>
  );
}
