"use client";

import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

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
    <HStack gap={1} vAlign="center">
      {Array.from({ length: MAX_RATING }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(value);
        const Star = isFilled ? StarIcon : StarOutlineIcon;
        if (!onChange) {
          return (
            <Star
              key={starValue}
              width={16}
              height={16}
              aria-hidden="true"
              className={isFilled ? "text-[var(--color-text-accent)]" : undefined}
            />
          );
        }
        return (
          <button
            key={starValue}
            type="button"
            aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
            className="cursor-pointer leading-none p-0"
            onClick={() => onChange(starValue)}
          >
            <Star
              width={20}
              height={20}
              className={isFilled ? "text-[var(--color-text-accent)]" : undefined}
            />
          </button>
        );
      })}
      {showValue && (
        <Text type="supporting" color="secondary">
          {value > 0 ? value.toFixed(1) : "No ratings yet"}
        </Text>
      )}
    </HStack>
  );
}
