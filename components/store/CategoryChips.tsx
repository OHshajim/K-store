"use client";

import { HStack } from "@astryxdesign/core/HStack";
import { Token } from "@astryxdesign/core/Token";
import type { Category } from "@/lib/types";

export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <HStack gap={2} wrap="wrap">
      <Token label="All" href="/shop" color={!activeSlug ? "blue" : "default"} />
      {categories.map((category) => (
        <Token
          key={category.id}
          label={category.name}
          href={`/shop?category=${encodeURIComponent(category.slug)}`}
          color={activeSlug === category.slug ? "blue" : "default"}
        />
      ))}
    </HStack>
  );
}
