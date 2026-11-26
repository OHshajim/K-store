"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  LayoutGrid,
  List,
  Copy,
  Check,
  Feather,
  Layers,
  Calendar,
  Eye,
} from "lucide-react";
import type { EditorialArticle } from "@/lib/data/editorial";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { slugify } from "@/lib/format";

const DEFAULT_JOURNAL_IMAGES: Record<string, string> = {
  philosophy: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  lighting: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
  workspace: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
  general: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
};

const SUGGESTED_THEMES = [
  "Design Philosophy",
  "Atmospheric Lighting",
  "Workspace Harmony",
  "Material Craftsmanship",
  "Living Sanctuary",
];

const CURATED_PRESET_IMAGES = [
  {
    label: "Living Room & Timber",
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Atmospheric Pendant",
    url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Architectural Workspace",
    url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Minimalist Lounge",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
  },
];

function EssayCardImage({ src, alt, category }: { src: string; alt: string; category: string }) {
  const fallback =
    DEFAULT_JOURNAL_IMAGES[category.toLowerCase().split(" ")[0]] ||
    DEFAULT_JOURNAL_IMAGES.general;
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      key={src}
      src={hasError ? fallback : src || fallback}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
      onError={() => setHasError(true)}
    />
  );
}

export function JournalManager({ initialArticles }: { initialArticles: EditorialArticle[] }) {
  const router = useRouter();
  const [articles, setArticles] = useState<EditorialArticle[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Form & Drawer State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Design Philosophy");
  const [readTime, setReadTime] = useState("5 min read");
  const [date, setDate] = useState("February 2026");
  const [authorName, setAuthorName] = useState("Henrik Lindqvist");
  const [authorRole, setAuthorRole] = useState("Principal Architectural Curator");
  const [image, setImage] = useState("");
  const [summary, setSummary] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [rawTakeaways, setRawTakeaways] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [essayToDelete, setEssayToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingEssay, setIsDeletingEssay] = useState(false);

  // Close modal on Escape and lock body scroll
  useEffect(() => {
    if (!isEditing) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        setIsEditing(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, isSubmitting]);

  // All distinct categories
  const categoriesList = useMemo(() => {
    const set = new Set(articles.map((a) => a.category).filter(Boolean));
    return Array.from(set);
  }, [articles]);

  // Filtered essays
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.category.toLowerCase().includes(q) ||
        art.author.name.toLowerCase().includes(q);

      const matchesCat =
        selectedCategory === "all" || art.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [articles, searchQuery, selectedCategory]);

  const handleCopySlug = (artSlug: string) => {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(`/journal/${artSlug}`);
      setCopiedSlug(artSlug);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCategory("Design Philosophy");
    setReadTime("5 min read");
    setDate("February 2026");
    setAuthorName("Henrik Lindqvist");
    setAuthorRole("Principal Architectural Curator");
    setImage("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80");
    setSummary("");
    setRawContent("");
    setRawTakeaways("");
    setError(null);
    setIsEditing(true);
  };

  const startEdit = (art: EditorialArticle) => {
    setEditingId(art.id);
    setTitle(art.title);
    setSlug(art.slug);
    setCategory(art.category);
    setReadTime(art.readTime);
    setDate(art.date);
    setAuthorName(art.author?.name || "Henrik Lindqvist");
    setAuthorRole(art.author?.role || "Principal Architectural Curator");
    setImage(art.image);
    setSummary(art.summary);
    setRawContent(art.content?.join("\n\n") || art.summary);
    setRawTakeaways(art.keyTakeaways?.join("\n") || "");
    setError(null);
    setIsEditing(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingId) {
      setSlug(slugify(newTitle));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !image.trim()) {
      setError("Please provide an essay title, summary, and cover image.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const paragraphs = rawContent
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const takeaways = rawTakeaways
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const finalSlug = slug.trim() ? slugify(slug) : slugify(title);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      category: category.trim(),
      readTime: readTime.trim(),
      date: date.trim(),
      author_name: authorName.trim(),
      author_role: authorRole.trim(),
      image: image.trim(),
      summary: summary.trim(),
      content: paragraphs.length > 0 ? paragraphs : [summary.trim()],
      keyTakeaways: takeaways,
      relatedProductSlugs: ["modular-storage-shelf", "minimalist-side-table"],
    };

    try {
      const url = editingId ? `/api/admin/journal/${editingId}` : "/api/admin/journal";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save article");

      if (editingId) {
        setArticles((prev) =>
          prev.map((a) => (a.id === editingId ? data.article : a))
        );
        setSuccess("Essay updated successfully.");
      } else {
        setArticles((prev) => [data.article, ...prev]);
        setSuccess("New essay published to storefront journal.");
      }

      setIsEditing(false);
      router.refresh();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateDeleteEssay = (id: string, essayTitle: string) => {
    setEssayToDelete({ id, title: essayTitle });
  };

  const executeDeleteEssay = async () => {
    if (!essayToDelete) return;

    setIsDeletingEssay(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/journal/${essayToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      const deletedTitle = essayToDelete.title;
      setArticles((prev) => prev.filter((a) => a.id !== essayToDelete.id));
      setEssayToDelete(null);
      setSuccess(`Deleted essay "${deletedTitle}".`);
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Unable to delete article.");
      setEssayToDelete(null);
    } finally {
      setIsDeletingEssay(false);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#B78E69]" />
            <span>Storefront Editorial</span>
            <span>·</span>
            <span>Content CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1C18]">
            Journal &amp; Design Essays
          </h1>
          <p className="text-xs sm:text-sm text-[#4A483E]/80">
            Publish thoughtful architectural essays, styling advice, and material narratives to the storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          data-btn="dark"
          style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#32362F] transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span style={{ color: "#FFFFFF" }}>Publish New Essay</span>
        </button>
      </div>

      {/* 2. Top Editorial Intelligence Overview Cards (Matches Reviews/Categories KPI Strips) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#8A927A]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Published Essays
            </span>
            <BookOpen className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">
            {articles.length}
          </div>
          <div className="text-[10px] text-emerald-700 font-mono font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active on storefront</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#8A927A]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Themes Covered
            </span>
            <Layers className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">
            {categoriesList.length}
          </div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">
            Spatial taxonomy
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#8A927A]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Average Read Time
            </span>
            <Clock className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1C18]">
            5.3 min
          </div>
          <div className="text-[10px] text-[#4A483E]/70 font-mono">
            Deep architectural essays
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.03)] space-y-1">
          <div className="flex items-center justify-between text-[#8A927A]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider">
              Live Storefront
            </span>
            <Feather className="w-4 h-4 text-[#B78E69]" />
          </div>
          <div className="text-sm font-bold text-[#1A1C18] truncate pt-1">
            The Art of Living Well
          </div>
          <div className="text-[10px] text-[#B78E69] font-mono hover:underline">
            <Link href="/journal" target="_blank">
              View public journal →
            </Link>
          </div>
        </div>
      </div>

      {/* Success / Error Banners */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Search, Filter & View Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-[0_2px_8px_rgba(26,28,24,0.02)]">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A483E]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, author, topic..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-[#1A1C18]/15 bg-[#FAF9F6] text-xs text-[#1A1C18] placeholder-[#4A483E]/50 focus:outline-none focus:ring-2 focus:ring-[#1A1C18]/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#4A483E]/50 hover:text-[#1A1C18] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter Pills & View Mode */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Theme Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#1A1C18] text-white shadow-2xs"
                  : "bg-[#FAF9F6] text-[#4A483E] hover:bg-stone-100 border border-[#1A1C18]/8"
              }`}
            >
              All Themes
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#1A1C18] text-white shadow-2xs"
                    : "bg-[#FAF9F6] text-[#4A483E] hover:bg-stone-100 border border-[#1A1C18]/8"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#FAF9F6] border border-[#1A1C18]/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#1A1C18] shadow-xs font-semibold"
                  : "text-[#4A483E]/60 hover:text-[#1A1C18]"
              }`}
              title="Gallery Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#1A1C18] shadow-xs font-semibold"
                  : "text-[#4A483E]/60 hover:text-[#1A1C18]"
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Visual Gallery Cards Grid / Table View */}
      {filteredArticles.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl bg-white border border-[#1A1C18]/10 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8A927A]/15 text-[#8A927A] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-editorial text-xl font-bold text-[#1A1C18]">
              No Essays Match Your Query
            </h3>
            <p className="text-xs text-[#4A483E]/70 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No essays found matching "${searchQuery}". Try a different keyword.`
                : "Your storefront does not have any published essays yet."}
            </p>
          </div>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-stone-50 cursor-pointer"
            >
              Reset Filters
            </button>
          ) : (
            <button
              type="button"
              onClick={startCreate}
              className="px-5 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] cursor-pointer"
            >
              Draft Your First Essay
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* Visual Gallery Cards Grid (Exact Design from Image 1) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => {
            const authorInitials = art.author.name
              ? art.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "ED";

            return (
              <div
                key={art.id}
                className="bg-white rounded-3xl p-5 border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.04)] hover:shadow-[0_12px_32px_rgba(26,28,24,0.08)] hover:border-[#1A1C18]/25 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Framed Cover Photography (16:10 Ratio with Fallback) */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#F4F0E8] border border-[#1A1C18]/5">
                    <EssayCardImage
                      src={art.image}
                      alt={art.title}
                      category={art.category}
                    />

                    {/* Subtle Overlay Badges: Category & Reading Time */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                      <span className="px-2.5 py-1 rounded-full bg-[#1A1C18]/85 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wider uppercase border border-white/10 shadow-xs">
                        {art.category}
                      </span>

                      <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#1A1C18] text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                        <Clock className="w-3 h-3 text-[#B78E69]" />
                        <span>{art.readTime}</span>
                      </span>
                    </div>
                  </div>

                  {/* Structured Editorial Content Body */}
                  <div className="pt-4 pb-2 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#8A927A] flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#8A927A]" />
                        {art.date}
                      </span>

                      <Link
                        href={`/journal/${art.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A927A] hover:text-[#1A1C18] transition-colors"
                      >
                        <span>Storefront</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <h3 className="font-editorial text-2xl font-bold text-[#1A1C18] tracking-tight group-hover:text-[#B78E69] transition-colors leading-snug line-clamp-2 min-h-[3.75rem]">
                      {art.title}
                    </h3>

                    <p className="text-xs text-[#4A483E]/80 leading-relaxed font-sans line-clamp-2 min-h-[2.5rem]">
                      {art.summary}
                    </p>

                    {/* Author Profile Indicator */}
                    <div className="pt-2 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FAF9F6] border border-[#1A1C18]/10 text-xs font-bold text-[#1A1C18] flex items-center justify-center shrink-0">
                        {authorInitials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#1A1C18] block truncate">
                          {art.author.name}
                        </span>
                        <span className="text-[10px] text-[#8A927A] font-mono block truncate">
                          {art.author.role}
                        </span>
                      </div>
                    </div>

                    {/* Route Slug Identifier with Copy Action */}
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#FAF9F6] border border-[#1A1C18]/8 text-[#4A483E] text-[11px] font-mono">
                        <span className="text-[#8A927A]">/journal/</span>
                        <span className="font-semibold text-[#1A1C18]">{art.slug}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySlug(art.slug)}
                          title="Copy storefront link slug"
                          className="p-0.5 text-stone-400 hover:text-[#1A1C18] transition-colors ml-0.5 cursor-pointer"
                        >
                          {copiedSlug === art.slug ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tactile Action & Management Toolbar */}
                <div className="pt-4 border-t border-[#1A1C18]/8 mt-3 flex items-center justify-between">
                  <Link
                    href={`/journal/${art.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A1C18]/10 bg-[#FAF9F6] text-xs font-semibold text-[#1A1C18] hover:bg-white hover:border-[#1A1C18]/25 transition-all shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#B78E69]" />
                    <span>View in Store</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(art)}
                      data-btn="dark"
                      style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#2D302A] transition-all shadow-xs cursor-pointer"
                      title="Edit Essay"
                    >
                      <Pencil className="w-3.5 h-3.5 text-white" />
                      <span style={{ color: "#FFFFFF" }}>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => initiateDeleteEssay(art.id, art.title)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Essay"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table List View Mode (Desktop) & Cards (Mobile/Tablet) */
        <div className="bg-white rounded-3xl border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.03)] overflow-hidden">
          {/* Mobile & Tablet Card View */}
          <div className="lg:hidden p-3 sm:p-4 space-y-3">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="rounded-2xl border border-[#1A1C18]/10 bg-[#FAF9F6]/50 p-4 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-14 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#1A1C18]/10">
                    <EssayCardImage
                      src={art.image}
                      alt={art.title}
                      category={art.category}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-editorial text-base font-bold text-[#1A1C18] line-clamp-1">
                      {art.title}
                    </h4>
                    <span className="text-[11px] text-[#4A483E]/70 line-clamp-2">
                      {art.summary}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#1A1C18]/8 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[#1A1C18]/10 text-[10px] font-mono uppercase font-bold text-[#1A1C18]">
                    {art.category}
                  </span>
                  <div className="text-right">
                    <span className="font-medium text-[#1A1C18] block text-xs">
                      {art.author.name}
                    </span>
                    <span className="text-[10px] text-[#8A927A] font-mono">
                      {art.author.role} · {art.readTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#1A1C18]/8">
                  <Link
                    href={`/journal/${art.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A927A] hover:text-[#1A1C18] truncate min-w-0"
                  >
                    <span className="truncate">/journal/{art.slug}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </Link>
                  <div className="inline-flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(art)}
                      className="px-3 py-1 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#32362F] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => initiateDeleteEssay(art.id, art.title)}
                      className="p-1 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1A1C18]/10 bg-[#FAF9F6] text-[11px] font-mono text-[#8A927A] uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-semibold">Essay Overview</th>
                  <th className="py-3.5 px-4 font-semibold">Theme</th>
                  <th className="py-3.5 px-4 font-semibold">Curator / Author</th>
                  <th className="py-3.5 px-4 font-semibold">Read Velocity</th>
                  <th className="py-3.5 px-4 font-semibold">Storefront</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1C18]/8 text-xs">
                {filteredArticles.map((art) => (
                  <tr
                    key={art.id}
                    className="hover:bg-[#FAF9F6] transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-10 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#1A1C18]/10">
                          <EssayCardImage
                            src={art.image}
                            alt={art.title}
                            category={art.category}
                          />
                        </div>
                        <div>
                          <h4 className="font-editorial text-base font-bold text-[#1A1C18] line-clamp-1 group-hover:text-[#B78E69] transition-colors">
                            {art.title}
                          </h4>
                          <span className="text-[11px] text-[#4A483E]/70 line-clamp-1">
                            {art.summary}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[#1A1C18]/10 text-[10px] font-mono uppercase font-bold text-[#1A1C18]">
                        {art.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-[#1A1C18]">
                      <div>{art.author.name}</div>
                      <div className="text-[10px] text-[#8A927A] font-mono">
                        {art.author.role}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-[#4A483E]">
                      {art.readTime}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        href={`/journal/${art.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A927A] hover:text-[#1A1C18]"
                      >
                        <span>/journal/{art.slug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEdit(art)}
                          className="px-3 py-1 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#32362F] cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => initiateDeleteEssay(art.id, art.title)}
                          className="p-1 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Editorial Studio Modal (Create & Edit) */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) setIsEditing(false);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-[#1A1C18]/15 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#1A1C18]/10 flex items-center justify-between bg-[#FAF9F6] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#1A1C18] text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#B78E69]" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#1A1C18]">
                    {editingId ? "Edit Journal Essay" : "Draft New Journal Essay"}
                  </h3>
                  <p className="text-xs text-[#4A483E]/75">
                    {editingId
                      ? "Refine essay prose, imagery, and architectural recommendations."
                      : "Create a new Scandinavian narrative for the storefront living journal."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 text-[#4A483E] hover:text-[#1A1C18] rounded-xl hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Scrollable Form */}
            <form id="journal-essay-form" onSubmit={handleSave} className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Essay Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. The Architecture of Calm: 5 Principles for Intentional Living"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Storefront URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. principles-of-scandinavian-organization"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs font-mono text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Category / Theme
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Design Philosophy"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all"
                  />
                  {/* Preset Theme Chips */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {SUGGESTED_THEMES.map((th) => (
                      <button
                        key={th}
                        type="button"
                        onClick={() => setCategory(th)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          category === th
                            ? "bg-[#1A1C18] text-white border-[#1A1C18]"
                            : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                        }`}
                      >
                        {th}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Estimated Reading Time
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Publication Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. February 2026"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Henrik Lindqvist"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Author Role
                  </label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="e.g. Principal Architectural Curator"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <ImageUploadInput
                    bucket="banners"
                    label="Cover Photography (Upload Image or Paste URL)"
                    value={image}
                    onChange={setImage}
                  />

                  {/* Preset Architectural Photography Options */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                    <span className="text-[10px] font-mono text-stone-500 uppercase">Presets:</span>
                    {CURATED_PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImage(preset.url)}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Summary / Standfirst Excerpt
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief 1-2 sentence teaser displayed in index cards and storefront feeds..."
                    className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 text-sm leading-relaxed text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all resize-y"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Essay Content (Separate paragraphs with double Enter)
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={rawContent}
                    onChange={(e) => setRawContent(e.target.value)}
                    placeholder="Draft your full architectural essay paragraphs here..."
                    className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 text-sm text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all font-sans leading-relaxed resize-y"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider block">
                    Key Takeaways (One principle per line)
                  </label>
                  <textarea
                    rows={3}
                    value={rawTakeaways}
                    onChange={(e) => setRawTakeaways(e.target.value)}
                    placeholder="Keep at least 30% of horizontal surface planes unoccupied...&#10;Layer lighting across multiple elevations..."
                    className="w-full px-4 py-3 rounded-xl border border-[#1A1C18]/15 text-sm leading-relaxed text-[#1A1C18] placeholder:text-[#4A483E]/45 focus:outline-none focus-visible:outline-none focus:border-[#B78E69] focus:ring-2 focus:ring-[#B78E69]/25 bg-[#FAF9F6] focus:bg-white transition-all resize-y"
                  />
                </div>
              </div>
            </form>

            {/* Modal Fixed Footer Controls (Never overlaps form fields) */}
            <div className="px-6 py-4 border-t border-[#1A1C18]/10 bg-[#FAF9F6] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-mono text-[#8A927A] hidden sm:flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#B78E69]" />
                <span>Storefront URL: /journal/{slug || "slug"}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  Discard &amp; Close
                </button>
                <button
                  type="submit"
                  form="journal-essay-form"
                  disabled={isSubmitting}
                  data-btn="dark"
                  style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                  className="px-6 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-semibold hover:bg-[#32362F] transition-all shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{editingId ? "Saving Changes..." : "Publishing Essay..."}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#B78E69]" />
                      <span style={{ color: "#FFFFFF" }}>
                        {editingId ? "Save Essay Changes" : "Publish to Storefront"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Essay Deletion Confirmation Modal */}
      {essayToDelete && (
        <ConfirmationModal
          isOpen={!!essayToDelete}
          onClose={() => {
            if (!isDeletingEssay) setEssayToDelete(null);
          }}
          onConfirm={executeDeleteEssay}
          isLoading={isDeletingEssay}
          title="Delete Journal Essay"
          subtitle="Editorial CMS Action"
          variant="danger"
          confirmText="Yes, Delete Essay"
          cancelText="Keep Essay"
          description={
            <div className="space-y-2">
              <p>
                Are you sure you want to delete <strong className="text-[#1A1C18]">&quot;{essayToDelete.title}&quot;</strong>?
              </p>
              <p className="text-stone-600 text-xs">
                This action will permanently unpublish this editorial story and remove it from the Scandinavian living journal.
              </p>
            </div>
          }
        />
      )}
    </div>
  );
}
