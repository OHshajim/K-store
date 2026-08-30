"use client";

import { useState, type CSSProperties } from "react";
import { AspectRatio } from "@astryxdesign/core/AspectRatio";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import {
  Collapsible,
  CollapsibleGroup,
} from "@astryxdesign/core/Collapsible";
import { Divider } from "@astryxdesign/core/Divider";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { SelectableCard } from "@astryxdesign/core/SelectableCard";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import {
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import type { Product, StoreSettings } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/lib/cart/store";

const stickyInfo: CSSProperties = {
  position: "sticky",
  top: "var(--spacing-6)",
  alignSelf: "start",
};

export function ProductDetailView({
  product,
  settings,
}: {
  product: Product;
  settings: StoreSettings;
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState<number | null>(1);
  const addProduct = useCartStore((state) => state.addProduct);
  const images = product.images.length
    ? product.images
    : ["/icons/icon-512.png"];
  const maxQuantity = Math.max(product.stock, 1);
  const qty = quantity ?? 1;
  const onSale =
    product.compare_at_cents !== null &&
    product.compare_at_cents > product.price_cents;

  return (
    <Grid columns={{ minWidth: 320, repeat: "fit" }} gap={6}>
      <VStack gap={3}>
        <Card padding={0} variant="muted">
          <AspectRatio ratio={4 / 5} fit="cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[selectedImage]} alt={product.name} />
          </AspectRatio>
        </Card>
        {images.length > 1 && (
          <Grid columns={3} gap={2}>
            {images.map((src, index) => (
              <AspectRatio key={`${src}-${index}`} ratio={1} fit="cover">
                <SelectableCard
                  label={`View ${product.name} image ${index + 1}`}
                  isSelected={selectedImage === index}
                  onChange={() => setSelectedImage(index)}
                  variant="transparent"
                  padding={0}
                  width="100%"
                  height="100%"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                </SelectableCard>
              </AspectRatio>
            ))}
          </Grid>
        )}
      </VStack>

      <VStack gap={5} style={stickyInfo}>
        <VStack gap={2}>
          <Text type="display-2" as="h1">
            {product.name}
          </Text>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="large" weight="bold">
              {formatMoney(
                product.price_cents,
                settings.currency_symbol,
                settings.currency,
              )}
            </Text>
            {onSale && (
              <>
                <Text type="body" color="secondary" hasStrikethrough>
                  {formatMoney(
                    product.compare_at_cents!,
                    settings.currency_symbol,
                    settings.currency,
                  )}
                </Text>
                <Badge variant="error" label="Sale" />
              </>
            )}
          </HStack>
          <HStack gap={2} vAlign="center">
            <Badge
              variant={product.stock > 0 ? "success" : "error"}
              label={product.stock > 0 ? "In stock" : "Out of stock"}
            />
            {product.stock > 0 && (
              <Text type="supporting" color="secondary">
                {product.stock} available
              </Text>
            )}
          </HStack>
        </VStack>

        <Text type="large">{product.description}</Text>

        <VStack gap={2}>
          <Text type="label">Quantity</Text>
          <HStack gap={1} vAlign="center">
            <Button
              label="Decrease quantity"
              variant="ghost"
              icon={<Icon icon={MinusIcon} size="sm" />}
              clickAction={() => setQuantity((q) => Math.max(1, (q ?? 1) - 1))}
              isDisabled={qty <= 1 || product.stock <= 0}
              isIconOnly
            />
            <Center width={100}>
              <NumberInput
                label="Quantity"
                isLabelHidden
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={maxQuantity}
                isIntegerOnly
                isDisabled={product.stock <= 0}
              />
            </Center>
            <Button
              label="Increase quantity"
              variant="ghost"
              icon={<Icon icon={PlusIcon} size="sm" />}
              clickAction={() =>
                setQuantity((q) => Math.min(maxQuantity, (q ?? 1) + 1))
              }
              isDisabled={qty >= maxQuantity || product.stock <= 0}
              isIconOnly
            />
          </HStack>
        </VStack>

        <VStack gap={2}>
          <Button
            label="Add to cart"
            variant="primary"
            size="lg"
            icon={<Icon icon={ShoppingCartIcon} size="sm" />}
            isDisabled={product.stock <= 0}
            onClick={() => addProduct(product, qty)}
          />
          <Button
            label="Buy it now"
            size="lg"
            isDisabled={product.stock <= 0}
            onClick={() => {
              addProduct(product, qty);
              window.location.assign("/checkout");
            }}
          />
        </VStack>

        <CollapsibleGroup type="multiple" defaultValue={["details"]}>
          <Divider />
          <Collapsible
            value="details"
            trigger={<Text type="large" weight="bold">Details</Text>}
          >
            <Text type="body">{product.details || product.description}</Text>
          </Collapsible>
          <Divider />
          <Collapsible
            value="delivery"
            trigger={<Text type="large" weight="bold">Delivery &amp; returns</Text>}
          defaultIsOpen={false}
          >
            <Text type="body">{settings.delivery_notes}</Text>
          </Collapsible>
          <Divider />
          <Collapsible
            value="payment"
            trigger={<Text type="large" weight="bold">Payment</Text>}
            defaultIsOpen={false}
          >
            <Text type="body">{settings.payment_instructions}</Text>
          </Collapsible>
          <Divider />
        </CollapsibleGroup>
      </VStack>
    </Grid>
  );
}
