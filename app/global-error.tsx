"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#F4F0E8] text-[#1A1C18] min-h-screen flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-black/10 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#B78E69]/15 text-[#B78E69] mx-auto flex items-center justify-center mb-5">
            <AlertCircle className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#1A1C18] mb-2 font-serif">
            System Disruption
          </h2>

          <p className="text-xs text-[#4A483E] mb-6 leading-relaxed">
            A critical application error occurred. Please refresh the page or return to the main entry point.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#32362F] transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reload Application
            </button>
            <Link
              href="/"
              className="px-5 py-2.5 bg-[#F4F0E8] text-[#1A1C18] text-xs font-semibold rounded-xl hover:bg-white border border-black/10 transition-all flex items-center gap-2"
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

