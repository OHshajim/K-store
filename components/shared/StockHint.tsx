import { Flame } from "lucide-react";

export const LOW_STOCK_THRESHOLD = 5;

/**
 * Honest scarcity cue: renders only when stock is low (but not gone) so the
 * message always reflects real database stock.
 */
export function StockHint({ stock }: { stock: number }) {
  if (stock <= 0 || stock > LOW_STOCK_THRESHOLD) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B78E69]">
      <Flame className="w-3.5 h-3.5 text-[#B78E69]" />
      <span>Only {stock} left in stock</span>
    </span>
  );
}
