"use client";

import { Grid } from "@astryxdesign/core/Grid";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import type { Product, StoreSettings } from "@/lib/types";
import { ProductCard } from "@/components/store/ProductCard";

export function ProductGrid({
  products,
  settings,
}: {
  products: Product[];
  settings: StoreSettings;
}) {
  const router = useRouter();

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try another category or clear your search."
        icon={<Icon icon={ShoppingBagIcon} size="lg" />}
        actions={
          <Button
            label="Browse all"
            variant="primary"
            onClick={() => router.push("/shop")}
          />
        }
      />
    );
  }

  return (
    <Grid columns={{ minWidth: 240, repeat: "fit" }} gap={4}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} settings={settings} />
      ))}
    </Grid>
  );
}
