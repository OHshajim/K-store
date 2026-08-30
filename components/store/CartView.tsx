"use client";

import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { List, ListItem } from "@astryxdesign/core/List";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { Text } from "@astryxdesign/core/Text";
import { Thumbnail } from "@astryxdesign/core/Thumbnail";
import { VStack } from "@astryxdesign/core/VStack";
import { ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { StoreSettings } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/lib/cart/store";

export function CartView({ settings }: { settings: StoreSettings }) {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore((state) => state.subtotalCents());
  const shipping =
    settings.free_shipping_over_cents !== null &&
    subtotal >= settings.free_shipping_over_cents
      ? 0
      : settings.shipping_flat_cents;

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add something you love to get started."
        icon={<Icon icon={ShoppingCartIcon} size="lg" />}
        actions={<Button label="Shop products" href="/shop" variant="primary" />}
      />
    );
  }

  return (
    <Grid columns={{ minWidth: 320, repeat: "fit" }} gap={6}>
      <VStack gap={4}>
        <Text type="display-2" as="h1">
          Cart
        </Text>
        <List header="Cart items" density="spacious" hasDividers>
          {items.map((item) => (
            <ListItem
              key={item.productId}
              label={item.name}
              description={
                <Text type="supporting" color="secondary">
                  {formatMoney(
                    item.priceCents,
                    settings.currency_symbol,
                    settings.currency,
                  )}{" "}
                  each
                </Text>
              }
              startContent={
                <Thumbnail
                  src={item.image ?? undefined}
                  alt={item.name}
                  label={item.name}
                />
              }
              endContent={
                <HStack gap={3} vAlign="center">
                  <NumberInput
                    label={`Quantity for ${item.name}`}
                    isLabelHidden
                    value={item.quantity}
                    onChange={(quantity) =>
                      setQuantity(item.productId, quantity)
                    }
                    min={0}
                    max={item.stock}
                    isIntegerOnly
                  />
                  <Text type="body" weight="bold">
                    {formatMoney(
                      item.priceCents * item.quantity,
                      settings.currency_symbol,
                      settings.currency,
                    )}
                  </Text>
                  <Button
                    label={`Remove ${item.name}`}
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={TrashIcon} size="sm" />}
                    onClick={() => removeItem(item.productId)}
                  />
                </HStack>
              }
            />
          ))}
        </List>
      </VStack>

      <Card padding={4} variant="muted">
        <VStack gap={4}>
          <Text type="large" weight="bold">
            Order summary
          </Text>
          <VStack gap={2}>
            <HStack hAlign="between">
              <Text type="body" color="secondary">
                Subtotal
              </Text>
              <Text type="body">
                {formatMoney(
                  subtotal,
                  settings.currency_symbol,
                  settings.currency,
                )}
              </Text>
            </HStack>
            <HStack hAlign="between">
              <Text type="body" color="secondary">
                Delivery
              </Text>
              <Text type="body">
                {shipping === 0
                  ? "Free"
                  : formatMoney(
                      shipping,
                      settings.currency_symbol,
                      settings.currency,
                    )}
              </Text>
            </HStack>
          </VStack>
          <Divider />
          <HStack hAlign="between" vAlign="center">
            <Text type="large" weight="bold">
              Total
            </Text>
            <Text type="large" weight="bold">
              {formatMoney(
                subtotal + shipping,
                settings.currency_symbol,
                settings.currency,
              )}
            </Text>
          </HStack>
          <VStack gap={2}>
            <Button
              label="Proceed to checkout"
              variant="primary"
              size="lg"
              href="/checkout"
            />
            <Button label="Continue shopping" href="/shop" size="lg" />
          </VStack>
        </VStack>
      </Card>
    </Grid>
  );
}
