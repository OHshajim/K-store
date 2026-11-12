"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home, AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error to monitoring in production
    console.error("Runtime exception captured by Kstore ErrorBoundary:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-[#F4F0E8] text-[#1A1C18]">
      <div className="max-w-lg mx-auto text-center bg-white p-8 sm:p-10 rounded-3xl border border-[#1A1C18]/12 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-[#B78E69]/15 text-[#B78E69] mx-auto flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#B78E69] block mb-2 font-sans">
          Atmospheric Interruption
        </span>

        <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1C18] mb-3">
          Something Disturbed the Space
        </h1>

        <p className="font-sans text-sm text-[#4A483E] leading-relaxed mb-8">
          We encountered an unexpected operational anomaly while rendering this space. You may retry reloading the component or return to the main gallery.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            data-btn="dark"
            style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#32362F] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
            <span style={{ color: "#FFFFFF" }}>Try Reloading</span>
          </button>

          <Link
            href="/"
            data-btn="light"
            style={{ color: "#1A1C18", backgroundColor: "#F4F0E8" }}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#F4F0E8] text-[#1A1C18] border border-[#1A1C18]/15 text-xs font-semibold rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#1A1C18]" />
            <span style={{ color: "#1A1C18" }}>Return Home</span>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[11px] text-[#4A483E]/60 font-mono">
            Incident Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

