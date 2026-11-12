"use client";

import { Star } from "lucide-react";

const MAX_RATING = 5;

/**
 * The single star-rating component. Read-only when no onChange is passed
 * (product summaries, review lists); interactive when onChange is given
 * (review forms).
 */
export function StarRating({
  value,
  onChange,
  showValue = false,
}: {
  value: number;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(value);
        if (!onChange) {
          return (
            <Star
              key={starValue}
              className={`w-3.5 h-3.5 ${
                isFilled
                  ? "text-[#B78E69] fill-[#B78E69]"
                  : "text-[#1A1C18]/15 fill-transparent"
              }`}
            />
          );
        }
        return (
          <button
            key={starValue}
            type="button"
            aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
            className="cursor-pointer leading-none p-0.5 hover:scale-110 transition-transform"
            onClick={() => onChange(starValue)}
          >
            <Star
              className={`w-4 h-4 ${
                isFilled
                  ? "text-[#B78E69] fill-[#B78E69]"
                  : "text-[#1A1C18]/20 fill-transparent"
              }`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="text-xs font-mono font-semibold text-[#4A483E] ml-1">
          {value > 0 ? value.toFixed(1) : "No ratings yet"}
        </span>
      )}
    </div>
  );
}
