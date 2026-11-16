"use client";

export type RecentlyViewedItem = {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  compare_at_cents?: number | null;
  image: string;
  room?: string | null;
  material?: string | null;
};

const STORAGE_KEY = "kstore_recently_viewed_items";
const MAX_ITEMS = 8;

let cachedItems: RecentlyViewedItem[] = [];
let cachedRaw: string | null = null;
const EMPTY_LIST: RecentlyViewedItem[] = [];

export function recordRecentlyViewed(item: RecentlyViewedItem): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: RecentlyViewedItem[] = raw ? JSON.parse(raw) : [];

    // Filter out duplicate if it already exists
    const filtered = existing.filter((p) => p.id !== item.id);

    // Prepend to top and limit to MAX_ITEMS
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
    const serialized = JSON.stringify(updated);
    localStorage.setItem(STORAGE_KEY, serialized);

    cachedRaw = serialized;
    cachedItems = updated;

    // Dispatch custom event so open tabs/components sync reactively
    window.dispatchEvent(new Event("kstore_recent_updated"));
  } catch (err) {
    console.warn("Unable to save recently viewed item:", err);
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return EMPTY_LIST;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedItems = EMPTY_LIST;
      return EMPTY_LIST;
    }
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    cachedItems = JSON.parse(raw) as RecentlyViewedItem[];
    return cachedItems;
  } catch {
    return EMPTY_LIST;
  }
}

export function subscribeRecentlyViewed(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("kstore_recent_updated", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("kstore_recent_updated", callback);
    window.removeEventListener("storage", callback);
  };
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    cachedRaw = null;
    cachedItems = EMPTY_LIST;
    window.dispatchEvent(new Event("kstore_recent_updated"));
  } catch {}
}
