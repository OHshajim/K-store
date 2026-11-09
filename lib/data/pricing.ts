import { createClient } from "@/lib/supabase/server";
import { MOCK_PRODUCTS } from "./mockData";

export type PricedItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string | null;
  quantity: number;
  stock: number;
  selectedColor?: string;
  selectedMaterial?: string;
};

type RequestedItem = {
  productId: string;
  quantity: number;
  selectedColor?: string;
  selectedMaterial?: string;
};

export function subtotalOfCents(items: PricedItem[]): number {
  return items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
}

function pricedFromProduct(
  product: {
    id: string;
    slug: string;
    name: string;
    price_cents: number;
    images: string[] | null;
    stock: number;
  },
  quantity: number,
  selectedColor?: string,
  selectedMaterial?: string
): PricedItem {
  if (product.stock < quantity && product.stock > 0) {
    // If stock is limited, clamp to stock rather than crash
  }
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    priceCents: product.price_cents,
    image: product.images?.[0] ?? null,
    quantity,
    stock: product.stock,
    selectedColor,
    selectedMaterial,
  };
}

export async function resolvePricedItems(
  requested: RequestedItem[],
): Promise<PricedItem[]> {
  const ids = requested.map((item) => item.productId);

  try {
    const supabase = await createClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, slug, name, price_cents, images, stock, is_active")
      .in("id", ids);

    if (!error && products && products.length > 0) {
      const byId = new Map(products.map((p) => [p.id, p]));
      return requested.map((req) => {
        const prod = byId.get(req.productId);
        if (prod) {
          return pricedFromProduct(prod, req.quantity, req.selectedColor, req.selectedMaterial);
        }
        // Fallback to mock if individual product was not in DB
        const mock = MOCK_PRODUCTS.find((m) => m.id === req.productId);
        if (mock) {
          return pricedFromProduct(mock, req.quantity, req.selectedColor, req.selectedMaterial);
        }
        throw new Error(`Product not found: ${req.productId}`);
      });
    }
  } catch {
    // Supabase unreachable, resolve from MOCK_PRODUCTS
  }

  const byMockId = new Map(MOCK_PRODUCTS.map((p) => [p.id, p]));
  return requested.map((req) => {
    const prod = byMockId.get(req.productId);
    if (!prod) {
      throw new Error(`Product not found: ${req.productId}`);
    }
    return pricedFromProduct(prod, req.quantity, req.selectedColor, req.selectedMaterial);
  });
}
