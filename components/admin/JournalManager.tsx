"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import type { EditorialArticle } from "@/lib/data/editorial";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";

export function JournalManager({ initialArticles }: { initialArticles: EditorialArticle[] }) {
  const router = useRouter();
  const [articles, setArticles] = useState<EditorialArticle[]>(initialArticles);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Design Philosophy");
  const [readTime, setReadTime] = useState("5 min read");
  const [date, setDate] = useState("November 2026");
  const [authorName, setAuthorName] = useState("Studio Curator");
  const [authorRole, setAuthorRole] = useState("Architectural Specialist");
  const [image, setImage] = useState("");
  const [summary, setSummary] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [rawTakeaways, setRawTakeaways] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const startCreate = () => {
    setEditingId(null);
    setTitle("");
    setCategory("Design Philosophy");
    setReadTime("5 min read");
    setDate("November 2026");
    setAuthorName("Studio Curator");
    setAuthorRole("Architectural Specialist");
    setImage("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80");
    setSummary("");
    setRawContent("");
    setRawTakeaways("");
    setError(null);
    setIsEditing(true);
  };

  const startEdit = (art: EditorialArticle) => {
    setEditingId(art.id);
    setTitle(art.title);
    setCategory(art.category);
    setReadTime(art.readTime);
    setDate(art.date);
    setAuthorName(art.author?.name || "Studio Curator");
    setAuthorRole(art.author?.role || "Architectural Specialist");
    setImage(art.image);
    setSummary(art.summary);
    setRawContent(art.content?.join("\n\n") || art.summary);
    setRawTakeaways(art.keyTakeaways?.join("\n") || "");
    setError(null);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !image.trim()) {
      setError("Please provide a title, summary, and cover image.");
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

    const payload = {
      title: title.trim(),
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
        setSuccess("Essay updated successfully!");
      } else {
        setArticles((prev) => [data.article, ...prev]);
        setSuccess("New essay published to storefront journal!");
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

  const handleDelete = async (id: string, essayTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${essayTitle}"?`)) return;

    try {
      const res = await fetch(`/api/admin/journal/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setArticles((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Essay deleted.");
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Unable to delete article.");
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8A927A] uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1C18] text-white text-xs font-semibold rounded-xl hover:bg-[#32362F] transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Publish New Essay</span>
        </button>
      </div>

      {/* Success / Error Banners */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Editor Modal / Drawer */}
      {isEditing && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#1A1C18]/15 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#1A1C18]/10">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1A1C18]">
              <Sparkles className="w-4 h-4 text-[#B78E69]" />
              <span>{editingId ? "Edit Journal Essay" : "Draft New Journal Essay"}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-[#4A483E] hover:text-[#1A1C18] rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                  Essay Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Architecture of Calm: 5 Principles for Intentional Living"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B78E69]/40 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Design Philosophy, Atmospheric Lighting"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B78E69]/40 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                  Estimated Reading Time
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="e.g. 5 min read"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B78E69]/40 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Henrik Lindqvist"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B78E69]/40 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                  Author Role
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="e.g. Senior Architectural Curator"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B78E69]/40 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <ImageUploadInput
                  bucket="banners"
                  label="Cover Photography"
                  value={image}
                  onChange={setImage}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                  Summary / Standfirst Excerpt
                </label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief 1-2 sentence teaser displayed in index cards and social previews..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B78E69]/40 bg-stone-50"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                  Essay Content (Separate paragraphs with double Enter)
                </label>
                <textarea
                  rows={8}
                  required
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="Draft your full architectural essay paragraphs here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B78E69]/40 bg-stone-50 font-sans leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider">
                  Key Takeaways (One principle per line)
                </label>
                <textarea
                  rows={3}
                  value={rawTakeaways}
                  onChange={(e) => setRawTakeaways(e.target.value)}
                  placeholder="Keep at least 30% of horizontal surface planes unoccupied...&#10;Layer lighting across multiple elevations..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#B78E69]/40 bg-stone-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1A1C18]/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 text-xs font-semibold text-[#4A483E] hover:text-[#1A1C18] rounded-xl hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                data-btn="accent"
                style={{ color: "#FFFFFF", backgroundColor: "#B78E69" }}
                className="px-6 py-2.5 bg-[#B78E69] text-white text-xs font-semibold rounded-xl hover:bg-[#a67c57] transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Publishing…" : editingId ? "Save Changes" : "Publish Essay"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Published Articles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            className="bg-white rounded-2xl overflow-hidden border border-[#1A1C18]/10 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <Image
                  src={art.image}
                  alt={art.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute top-2.5 left-2.5 bg-[#1A1C18]/85 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                  {art.category}
                </span>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#4A483E]/70 font-mono">
                  <span>{art.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {art.readTime}
                  </span>
                </div>
                <h3 className="font-editorial text-lg font-bold text-[#1A1C18] line-clamp-2 leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-[#4A483E] line-clamp-2 leading-relaxed font-sans">
                  {art.summary}
                </p>
                <div className="text-[11px] text-[#8A927A] font-medium pt-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{art.author.name}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-[#1A1C18]/5 mt-3 flex items-center justify-between gap-2 pt-3">
              <Link
                href={`/journal/${art.slug}`}
                target="_blank"
                className="text-xs font-semibold text-[#1A1C18] hover:text-[#B78E69] inline-flex items-center gap-1"
              >
                <span>Preview</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(art)}
                  className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
                  title="Edit Essay"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(art.id, art.title)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                  title="Delete Essay"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
