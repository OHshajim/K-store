import fs from "fs";
import path from "path";
import type { StoreSettings } from "@/lib/types";

const PERSISTED_FILE = path.join(process.cwd(), "lib", "data", "persisted_settings.json");

export function getPersistedSettings(): Partial<StoreSettings> {
  try {
    if (fs.existsSync(PERSISTED_FILE)) {
      const content = fs.readFileSync(PERSISTED_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // Ignore read errors
  }
  return {};
}

export function savePersistedSettings(updates: Partial<StoreSettings>) {
  try {
    const existing = getPersistedSettings();
    const merged = { ...existing, ...updates };
    fs.writeFileSync(PERSISTED_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist store settings locally:", err);
  }
}
