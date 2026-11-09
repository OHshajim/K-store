import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { EDITORIAL_ARTICLES } from "@/lib/data/editorial";

export const metadata: Metadata = {
  title: "Journal: The Art of Living Well — Kstore",
  description:
    "Architectural essays, Scandinavian interior philosophy, and thoughtful advice for designing peaceful domestic spaces.",
};

export default function JournalPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 font-sans">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          The Kstore Journal
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight text-[#292B27]">
          The Art of Living Well
        </h1>
        <p className="text-base sm:text-lg text-[#77766E] font-light">
          Observations on timber joinery, atmospheric 2700K lighting, and the subtle pleasures of an intentional home.
        </p>
      </div>

      {/* Featured Lead Story */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#292B27]/10 shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center">
        <div className="relative h-80 lg:h-full lg:col-span-7 bg-[#292B27]">
          <Image
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
            alt="Warm Scandinavian living room with timber shelving"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
        <div className="p-8 sm:p-12 lg:col-span-5 space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#B78E69] font-bold">
            Cover Story · Spring 2026
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#292B27] leading-snug">
            Make Room for What Matters: The Minimalist Living Paradigm
          </h2>
          <p className="text-xs sm:text-sm text-[#77766E] leading-relaxed">
            How clearing visual static and adopting fewer, generational timber furniture pieces can dramatically lower daily stress and encourage deep human connection.
          </p>
          <div className="pt-2 text-xs font-semibold text-[#292B27] flex items-center gap-2">
            <span>By Henrik Lindqvist, Senior Curator</span>
            <span>·</span>
            <span>7 min read</span>
          </div>
        </div>
      </div>

      {/* Grid of Journal Articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {EDITORIAL_ARTICLES.map((art) => (
          <article
            key={art.id}
            id={art.slug}
            className="bg-white rounded-2xl overflow-hidden border border-[#292B27]/10 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative h-60 overflow-hidden bg-[#D8C9B5]">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute top-3 left-3 bg-[#292B27]/80 backdrop-blur-xs text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                  {art.category}
                </span>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-[11px] text-[#77766E] font-mono">
                  <span>{art.date}</span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#292B27] leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-[#77766E] leading-relaxed">
                  {art.summary}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href="/shop"
                className="text-xs font-semibold text-[#292B27] hover:text-[#B78E69] flex items-center gap-1.5 transition-colors"
              >
                <span>Shop Related Essentials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
