"use client";

import Link from "next/link";
import { WifiOff, RotateCcw, Home, Sparkles } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6 sm:p-12">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#1A1C18]/10 shadow-lg max-w-lg w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#F4F0E8] mx-auto flex items-center justify-center text-[#B78E69]">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-[#8A927A] font-bold">
            Offline Sanctuary
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1C18]">
            Connection Paused
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80 leading-relaxed font-sans">
            Your network is currently out of reach. Previously cached Scandinavian collections and cart items remain safely preserved in local storage.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            data-btn="dark"
            style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#32362F] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" style={{ color: "#FFFFFF" }} />
            <span style={{ color: "#FFFFFF" }}>Try Reconnecting</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Storefront Home</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#1A1C18]/10 text-[11px] text-[#8A927A] flex items-center justify-center gap-1 font-mono">
          <Sparkles className="w-3 h-3 text-[#B78E69]" />
          Kstore Progressive Web App (PWA) Offline Engine
        </div>
      </div>
    </div>
  );
}
