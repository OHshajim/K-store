import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { FireIcon } from "@heroicons/react/24/outline";

export const LOW_STOCK_THRESHOLD = 5;

/**
 * Honest scarcity cue: renders only when stock is low (but not gone) so the
 * message always reflects real database stock.
 */
export function StockHint({ stock }: { stock: number }) {
  if (stock <= 0 || stock > LOW_STOCK_THRESHOLD) return null;

  return (
    <HStack gap={1} vAlign="center">
      <Icon icon={FireIcon} size="sm" color="accent" />
      <Text type="label" color="accent">
        Only {stock} left
      </Text>
    </HStack>
  );
}
