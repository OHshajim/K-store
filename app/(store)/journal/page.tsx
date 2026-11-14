import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, ArrowRight, Clock, Sparkles } from "lucide-react";
import { getArticles } from "@/lib/data/editorial";
import { requireStoreSettings } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await requireStoreSettings();
  const storeName = settings.store_name || "Kstore";
  return {
    title: `Journal: The Art of Living Well — ${storeName}`,
    description: `Architectural essays, Scandinavian interior philosophy, and thoughtful advice for designing peaceful domestic spaces.`,
  };
}

export default async function JournalPage() {
  const [articles, settings] = await Promise.all([
    getArticles(),
    requireStoreSettings(),
  ]);
  const storeName = settings.store_name || "Kstore";

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 font-sans">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-mono font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-[#B78E69]" />
          <span>The {storeName} Journal</span>
        </div>
        <h1 className="font-editorial text-4xl sm:text-6xl font-bold tracking-tight text-[#1A1C18]">
          The Art of Living Well
        </h1>
        <p className="text-base sm:text-lg text-[#4A483E]/80 font-light leading-relaxed">
          Observations on timber joinery, atmospheric 2700K lighting, and the subtle pleasures of an intentional home.
        </p>
      </div>

      {/* Featured Lead Story */}
      <div className="bg-white rounded-3xl overflow-hidden border border-[#1A1C18]/10 shadow-lg grid grid-cols-1 lg:grid-cols-12 items-center">
        <div className="relative h-80 lg:h-full lg:col-span-7 bg-[#1A1C18]">
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
            Cover Story · Featured Architecture
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#1A1C18] leading-snug">
            Make Room for What Matters: The Minimalist Living Paradigm
          </h2>
          <p className="text-xs sm:text-sm text-[#4A483E] leading-relaxed font-sans">
            How clearing visual static and adopting fewer, generational timber furniture pieces can dramatically lower daily stress and encourage deep human connection.
          </p>
          <div className="pt-2 text-xs font-semibold text-[#1A1C18] flex items-center gap-2">
            <span>By Henrik Lindqvist, Senior Curator</span>
            <span>·</span>
            <span>5 min read</span>
          </div>
          <div className="pt-4">
            <Link
              href="/journal/principles-of-scandinavian-organization"
              data-btn="dark"
              style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#32362F] transition-all shadow-md cursor-pointer"
            >
              <span style={{ color: "#FFFFFF" }}>Read Cover Essay</span>
              <ArrowRight className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Journal Articles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#1A1C18]/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B78E69]" />
            <h2 className="font-editorial text-2xl font-bold text-[#1A1C18]">
              Published Essays &amp; Design Notes
            </h2>
          </div>
          <span className="text-xs text-[#8A927A] font-mono">{articles.length} Essays Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#1A1C18]/10 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all duration-300 group"
            >
              <div>
                <Link href={`/journal/${art.slug}`} className="block relative h-60 overflow-hidden bg-[#D8C9B5]">
                  <Image
                    src={art.image}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute top-3 left-3 bg-[#1A1C18]/85 backdrop-blur-xs text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                    {art.category}
                  </span>
                </Link>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-[11px] text-[#4A483E]/70 font-mono">
                    <span>{art.date}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                  </div>
                  <Link href={`/journal/${art.slug}`}>
                    <h3 className="font-editorial text-xl font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors leading-snug">
                      {art.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#4A483E] leading-relaxed line-clamp-3">
                    {art.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#1A1C18]/5 mt-4">
                <Link
                  href={`/journal/${art.slug}`}
                  className="text-xs font-semibold text-[#1A1C18] group-hover:text-[#B78E69] flex items-center gap-1.5 transition-colors pt-3"
                >
                  <span>Read Full Essay</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
