import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar, User, CheckCircle2, ArrowRight } from "lucide-react";
import { getArticleBySlug, getArticles } from "@/lib/data/editorial";
import { getProducts, requireStoreSettings } from "@/lib/data/catalog";
import { ProductCard } from "@/components/store/ProductCard";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const settings = await requireStoreSettings();
  const storeName = settings.store_name || "Kstore";

  if (!article) return { title: `Article Not Found — ${storeName}` };
  return {
    title: `${article.title} — ${storeName} Journal`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [{ url: article.image }],
    },
  };
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticleDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const settings = await requireStoreSettings();
  const allProducts = await getProducts();
  const relatedProducts = allProducts.filter((p) =>
    article.relatedProductSlugs?.includes(p.slug)
  );

  return (
    <article className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      {/* 1. Back Navigation & Category */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10 text-xs">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-[#4A483E] hover:text-[#1A1C18] transition-colors font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Essays</span>
        </Link>
        <span className="px-3 py-1 rounded-full bg-[#8A927A]/15 text-[#8A927A] font-semibold uppercase tracking-wider text-[11px]">
          {article.category}
        </span>
      </div>

      {/* 2. Article Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1C18] leading-[1.12]">
          {article.title}
        </h1>
        <p className="font-sans text-base sm:text-lg text-[#4A483E]/80 leading-relaxed font-light">
          {article.summary}
        </p>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs text-[#4A483E]/70 font-mono">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#B78E69]" />
            <span>
              {article.author.name} · {article.author.role}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8A927A]" />
            <span>{article.readTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#8A927A]" />
            <span>{article.date}</span>
          </div>
        </div>
      </div>

      {/* 3. Hero Photography */}
      <div className="relative h-[340px] sm:h-[480px] rounded-3xl overflow-hidden shadow-xl border border-[#1A1C18]/10">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 900px"
          className="object-cover object-center"
        />
      </div>

      {/* 4. Article Body Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-12 border border-[#1A1C18]/10 shadow-xs space-y-8">
        <div className="prose prose-stone max-w-none space-y-6 text-[#1A1C18] font-sans leading-relaxed text-sm sm:text-base">
          {article.content.map((paragraph, idx) => (
            <p
              key={idx}
              className={idx === 0 ? "text-base sm:text-lg font-light leading-relaxed first-letter:text-4xl first-letter:font-editorial first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:text-[#1A1C18]" : ""}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Key Takeaways Box */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#F4F0E8] border border-[#1A1C18]/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#B78E69] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#B78E69]" />
              <span>Architectural Principles &amp; Takeaways</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#1A1C18]">
              {article.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A927A] mt-2 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Author Bio Footer */}
        <div className="pt-6 border-t border-[#1A1C18]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A483E]">
          <div>
            <span className="font-bold text-[#1A1C18] block">{article.author.name}</span>
            <span>{article.author.role} · {settings.store_name || "Kstore"} Studio</span>
          </div>
          <Link
            href="/journal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A1C18] hover:text-[#B78E69] transition-colors"
          >
            <span>Explore All Journal Essays</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. Featured in this Essay (Related Products) */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#8A927A] font-semibold block">
                Spatial Complements
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1C18]">
                Featured in this Essay
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-semibold text-[#1A1C18] hover:text-[#B78E69] inline-flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
