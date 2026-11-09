"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { EDITORIAL_ARTICLES } from "@/lib/data/editorial";

export function EditorialInspiration() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8A927A] mb-2 font-sans">
            <BookOpen className="w-3.5 h-3.5" />
            The Kstore Journal
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1C18]">
            The Art of Living Well
          </h2>
        </div>

        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A1C18] hover:text-[#B78E69] mt-4 md:mt-0 group transition-colors"
        >
          <span>Read All Essays</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3 Magazine Articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {EDITORIAL_ARTICLES.map((article) => (
          <Link
            key={article.id}
            href={`/journal#${article.slug}`}
            className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-[#1A1C18]/12 shadow-xs hover:shadow-xl transition-all duration-300"
          >
            {/* Image */}
            <div className="relative h-64 overflow-hidden bg-[#D8C9B5]">
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-3 left-3 bg-[#1A1C18]/85 backdrop-blur-xs text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md">
                {article.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#4A483E] mb-2 font-mono font-medium">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="font-editorial text-xl font-bold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors leading-snug mb-3">
                  {article.title}
                </h3>

                <p className="text-xs text-[#4A483E] line-clamp-3 leading-relaxed font-sans">
                  {article.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1A1C18]/10 flex items-center gap-2 text-xs font-semibold text-[#1A1C18] group-hover:text-[#B78E69] transition-colors">
                <span>Read Full Essay</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
