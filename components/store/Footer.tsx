"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Mail,
} from "lucide-react";
import { CurrencySelector } from "./CurrencySelector";

export function Footer({
  storeName = "Kstore",
  tagline = "Modern Living, Simplified.",
  supportEmail = "concierge@kstore.com",
}: {
  storeName?: string;
  tagline?: string;
  supportEmail?: string | null;
}) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-[#1A1C18] text-white pt-16 pb-12 border-t border-black/20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Value Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-white/5 text-[#B78E69]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Complimentary Shipping</h4>
              <p className="text-xs text-[#D8C9B5]/80 mt-1">
                Dispatched free on all orders over $150 across US, CA & UK.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-white/5 text-[#8A927A]">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">30-Day In-Home Trial</h4>
              <p className="text-xs text-[#D8C9B5]/80 mt-1">
                Experience our pieces in your space with hassle-free returns.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-white/5 text-[#B78E69]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">10-Year Craft Warranty</h4>
              <p className="text-xs text-[#D8C9B5]/80 mt-1">
                Kiln-dried solid timber and precision joinery built to endure.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-white/5 text-[#8A927A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Personal Concierge</h4>
              <p className="text-xs text-[#D8C9B5]/80 mt-1">
                Dedicated interior support available 7 days a week.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-white/10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Link href="/" className="inline-block">
                <span className="font-editorial text-3xl font-bold tracking-tight text-white uppercase">
                  {storeName}
                </span>
                <span className="block text-[10px] tracking-widest text-[#D8C9B5] uppercase font-sans mt-0.5">
                  Modern Living, Simplified
                </span>
              </Link>
            </div>
            <p className="text-sm text-[#D8C9B5]/80 max-w-sm leading-relaxed">
              Kstore is an international direct-to-consumer lifestyle house specializing in architectural home organization, functional furniture, and decorative lighting.
            </p>
            <div className="pt-2 text-xs text-[#D8C9B5]/70 space-y-1">
              <p>Studios in Småland, Vermont & Copenhagen.</p>
              <p>Contact: {supportEmail}</p>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#D8C9B5] mb-4">
              Shop Collections
            </h5>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link href="/shop?category=living-room" className="hover:text-white transition-colors">
                  Living Room
                </Link>
              </li>
              <li>
                <Link href="/shop?category=workspace" className="hover:text-white transition-colors">
                  Workspace
                </Link>
              </li>
              <li>
                <Link href="/shop?category=kitchen" className="hover:text-white transition-colors">
                  Kitchen Essentials
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bedroom" className="hover:text-white transition-colors">
                  Bedroom Sanctuaries
                </Link>
              </li>
              <li>
                <Link href="/shop?category=bathroom" className="hover:text-white transition-colors">
                  Bathroom Architecture
                </Link>
              </li>
              <li>
                <Link href="/shop?category=lighting" className="hover:text-white transition-colors">
                  Decorative Lighting
                </Link>
              </li>
              <li>
                <Link href="/fit-assistant" className="text-[#8A927A] hover:underline font-semibold flex items-center gap-1">
                  NORDEN Fit Assistant →
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#D8C9B5] mb-4">
              Information & Care
            </h5>
            <ul className="space-y-2.5 text-xs text-white/80">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Story & Design Principles
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-white transition-colors">
                  The Art of Living Well
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Shipping & Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Privacy Policy & Terms
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-[#D8C9B5]/60 hover:text-white transition-colors">
                  Store Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#D8C9B5] mb-4">
              Make Room For Inspiration
            </h5>
            <p className="text-xs text-[#D8C9B5]/80 mb-3 leading-relaxed">
              Subscribe to receive private preview access to small batch releases and architectural essays.
            </p>
            {subscribed ? (
              <div className="p-3 bg-white/10 rounded-lg text-xs text-[#8A927A] font-medium border border-[#8A927A]/30">
                Welcome to Kstore. Please check your inbox to confirm your subscription.
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-white/10 text-white placeholder:text-white/40 text-xs px-3.5 py-2.5 rounded-lg border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#D8C9B5]"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-[#B78E69] text-white rounded-md text-xs font-medium hover:bg-[#a57d59] transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-white/50 block">
                  By subscribing, you agree to our privacy policy and consent to email updates. Unsubscribe anytime.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar: Copyright & Currency */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#D8C9B5]/70">
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} Kstore International Ltd. All rights reserved.</span>
            <span className="hidden md:inline">·</span>
            <span className="hidden md:inline">Portfolio Case Study for Strix Devs</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px]">Region & Currency:</span>
            <CurrencySelector variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
