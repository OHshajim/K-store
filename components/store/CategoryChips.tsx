"use client";

import { HStack } from "@astryxdesign/core/HStack";
import { Icon, type IconType } from "@astryxdesign/core/Icon";
import { Token } from "@astryxdesign/core/Token";
import {
  FireIcon,
  HomeIcon,
  SparklesIcon,
  Squares2X2Icon,
  TagIcon,
} from "@heroicons/react/24/outline";
import type { Category } from "@/lib/types";

const CATEGORY_ICONS: Record<string, IconType> = {
  home: HomeIcon,
  kitchen: FireIcon,
  care: SparklesIcon,
};

export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  return (
    <HStack gap={2} wrap="wrap">
      <Token
        label="All"
        href="/shop"
        color={!activeSlug ? "blue" : "default"}
        icon={<Icon icon={Squares2X2Icon} size="sm" />}
      />
      {categories.map((category) => (
        <Token
          key={category.id}
          label={category.name}
          href={`/shop?category=${encodeURIComponent(category.slug)}`}
          color={activeSlug === category.slug ? "blue" : "default"}
          icon={
            <Icon icon={CATEGORY_ICONS[category.slug] ?? TagIcon} size="sm" />
          }
        />
      ))}
    </HStack>
  );
}
