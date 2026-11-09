"use client";

import { useState } from "react";
import { ArrowRight, Check, Mail, Sparkles } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!consent) {
      setError("Please confirm your consent to receive design communications.");
      return;
    }
    setError(null);
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-24 bg-[#1A1C18] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#D8C9B5] text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
          The Weekly Dispatch
        </div>

        <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
          Make room for inspiration.
        </h2>

        <p className="text-sm sm:text-base text-[#D8C9B5]/90 max-w-xl mx-auto mb-10 font-sans leading-relaxed">
          Be the first to explore seasonal furniture drops, private collector previews, and thoughtful essays on Scandinavian home design.
        </p>

        {submitted ? (
          <div className="bg-white/10 border border-[#8A927A]/40 p-6 rounded-3xl max-w-md mx-auto text-center space-y-2 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-[#8A927A] mx-auto flex items-center justify-center text-white">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="font-editorial text-xl font-bold text-white">
              You are on the list.
            </h4>
            <p className="text-xs text-[#D8C9B5]">
              Thank you for welcoming Kstore into your world. A confirmation has been dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-[#D8C9B5]/70 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#D8C9B5] transition-all"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-[#B78E69] hover:bg-[#a67c57] text-white text-sm font-semibold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                Subscribe
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2.5 text-left text-xs text-[#D8C9B5]/80 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 rounded border-white/30 text-[#B78E69] focus:ring-0 focus:ring-offset-0 bg-white/10"
              />
              <span>
                I agree to receive personalized newsletters and design releases. You can unsubscribe at any time in accordance with our{" "}
                <span className="underline text-white">privacy policy</span>.
              </span>
            </label>

            {error && (
              <p className="text-xs text-rose-300 font-medium text-left">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
