import { HStack } from "@astryxdesign/core/HStack";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

/**
 * Home-page section heading: accent kicker, title, hint, and an optional
 * "view all" affordance on the right.
 */
export function SectionHeader({
  kicker,
  title,
  hint,
  actionHref,
  actionLabel,
}: {
  kicker: string;
  title: string;
  hint: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <HStack hAlign="between" vAlign="end" wrap="wrap" gap={3}>
      <VStack gap={1}>
        <Text type="label" weight="bold" color="accent" className="uppercase tracking-wide">
          {kicker}
        </Text>
        <Heading level={2}>{title}</Heading>
        <Text type="body" color="secondary">
          {hint}
        </Text>
      </VStack>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="flex items-center gap-1 transition-colors hover:text-[var(--color-text-accent)]"
        >
          <Text type="body" weight="bold">
            {actionLabel}
          </Text>
          <ChevronRightIcon width={16} height={16} aria-hidden="true" />
        </Link>
      )}
    </HStack>
  );
}
