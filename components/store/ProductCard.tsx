"use client";

import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { HStack } from "@astryxdesign/core/HStack";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Product, StoreSettings } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/lib/cart/store";

export function ProductCard({
  product,
  settings,
}: {
  product: Product;
  settings: StoreSettings;
}) {
  const addProduct = useCartStore((state) => state.addProduct);
  const onSale =
    product.compare_at_cents !== null &&
    product.compare_at_cents > product.price_cents;

  return (
    <ClickableCard
      label={product.name}
      href={`/product/${product.slug}`}
      padding={0}
      elevation="low"
    >
      <VStack gap={3} padding={3}>
        <Card padding={0} variant="muted">
          <AspectRatio ratio={1} fit="cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0] || "/icons/icon-512.png"}
              alt={product.name}
            />
          </AspectRatio>
        </Card>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" hAlign="between">
            <Text type="label" as="h3">
              {product.name}
            </Text>
            {product.stock <= 0 && <Badge variant="error" label="Sold out" />}
            {onSale && product.stock > 0 && (
              <Badge variant="error" label="Sale" />
            )}
          </HStack>
          <Text type="body" color="secondary" maxLines={2}>
            {product.description}
          </Text>
        </VStack>
        <HStack gap={2} vAlign="center" hAlign="between">
          <VStack gap={0}>
            <Text type="large" weight="bold">
              {formatMoney(
                product.price_cents,
                settings.currency_symbol,
                settings.currency,
              )}
            </Text>
            {onSale && (
              <Text type="supporting" color="secondary" hasStrikethrough>
                {formatMoney(
                  product.compare_at_cents!,
                  settings.currency_symbol,
                  settings.currency,
                )}
              </Text>
            )}
          </VStack>
          <IconButton
            label={`Add ${product.name} to cart`}
            tooltip="Add to cart"
            variant="secondary"
            icon={<Icon icon={PlusIcon} size="sm" />}
            isDisabled={product.stock <= 0}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addProduct(product, 1);
            }}
          />
        </HStack>
      </VStack>
    </ClickableCard>
  );
}
