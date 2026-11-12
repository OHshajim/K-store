import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, ShieldCheck, Compass } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: `Sign In · ${APP_NAME}`,
  description: `Access your ${APP_NAME} sanctuary, track bespoke living orders, and manage account preferences.`,
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F4F0E8] text-[#1A1C18] flex flex-col lg:flex-row">
      {/* Left Lifestyle Visual Hero (Desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 min-h-screen bg-[#292B27] flex-col justify-between p-12 xl:p-16 text-white overflow-hidden">
        {/* Background Editorial Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85"
            alt="Warm Scandinavian minimalist interior living sanctuary with natural oak furnishings"
            fill
            priority
            sizes="50vw"
            className="object-cover object-center opacity-75 scale-102"
          />
          {/* Editorial Dark Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C18]/95 via-[#1A1C18]/50 to-[#1A1C18]/30" />
        </div>

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="group flex flex-col">
            <span className="font-editorial text-3xl font-bold tracking-tight text-white group-hover:text-[#D8C9B5] transition-colors uppercase">
              {APP_NAME}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#D8C9B5] -mt-1 font-sans font-semibold">
              Modern Living, Simplified
            </span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-[#D8C9B5] border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
            <span>Studio Sanctuary</span>
          </div>
        </div>

        {/* Center Editorial Quote */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8A927A]">
            <Compass className="w-3.5 h-3.5" />
            <span>The Kstore Philosophy</span>
          </div>
          <blockquote className="font-editorial text-3xl xl:text-4xl font-bold leading-tight text-white">
            &ldquo;Thoughtfully designed essentials for a quieter, more intentional home.&rdquo;
          </blockquote>
          <p className="text-sm text-[#F4F0E8]/80 leading-relaxed font-sans font-light">
            Every furniture piece, modular organizer, and sculptural luminaire is crafted in collaboration with Scandinavian woodworkers and artisan ceramicists.
          </p>
        </div>

        {/* Bottom Trust Pillars */}
        <div className="relative z-10 pt-8 border-t border-white/15 grid grid-cols-3 gap-4 text-xs text-[#D8C9B5]">
          <div>
            <span className="font-editorial text-xl font-bold text-white block">100%</span>
            <span className="text-[11px] text-[#D8C9B5]">FSC-Certified Oak</span>
          </div>
          <div>
            <span className="font-editorial text-xl font-bold text-white block">30-Day</span>
            <span className="text-[11px] text-[#D8C9B5]">In-Home Trial</span>
          </div>
          <div>
            <span className="font-editorial text-xl font-bold text-white block">10-Year</span>
            <span className="text-[11px] text-[#D8C9B5]">Craft Warranty</span>
          </div>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
          <Link
            href="/"
            className="lg:hidden flex flex-col items-start"
          >
            <span className="font-editorial text-2xl font-bold tracking-tight text-[#1A1C18] uppercase">
              {APP_NAME}
            </span>
            <span className="text-[8px] uppercase tracking-widest text-[#4A483E] -mt-1 font-sans font-semibold">
              Modern Living, Simplified
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#4A483E] hover:text-[#1A1C18] transition-colors ml-auto group py-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Store</span>
          </Link>
        </div>

        {/* Main Center Auth Card */}
        <div className="w-full max-w-md mx-auto my-auto">
          <Suspense
            fallback={
              <div className="p-12 bg-white rounded-3xl border border-[#1A1C18]/12 text-center text-xs text-[#4A483E]">
                Preparing secure authentication workspace…
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>

        {/* Bottom Trust & Legal Footer */}
        <div className="w-full max-w-md mx-auto mt-8 pt-6 border-t border-[#1A1C18]/10 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#4A483E]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8A927A]" />
            <span>End-to-End Encrypted Customer Sanctuary</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-[11px] text-[#4A483E]/70 font-sans">
            <Link href="/terms" className="hover:underline">
              Terms &amp; Policies
            </Link>
            <span>·</span>
            <Link href="/about" className="hover:underline">
              Brand Story
            </Link>
            <span>·</span>
            <span>&copy; {new Date().getFullYear()} {APP_NAME} Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
