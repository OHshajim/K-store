"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Grid } from "@astryxdesign/core/Grid";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { Selector } from "@astryxdesign/core/Selector";
import { Switch } from "@astryxdesign/core/Switch";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import type { Category, Product } from "@/lib/types";

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [details, setDetails] = useState(product?.details ?? "");
  const [price, setPrice] = useState((product?.price_cents ?? 0) / 100);
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [images, setImages] = useState(product?.images.join(", ") ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function saveProduct() {
    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            description,
            details: details || null,
            price_cents: Math.round(price * 100),
            stock,
            images: images.split(",").map((image) => image.trim()).filter(Boolean),
            is_active: isActive,
            is_featured: isFeatured,
            category_id: categoryId || null,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save product.");
      router.push(`/admin/products/${data.product?.id ?? data.id}`);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <VStack gap={4}>
      {error && <Banner status="error" title="Product not saved" description={error} />}
      <TextInput label="Product name" value={name} onChange={setName} isRequired />
      <TextInput label="Slug" value={slug} onChange={setSlug} isRequired />
      <TextArea label="Description" value={description} onChange={setDescription} isRequired />
      <TextArea label="Details" value={details} onChange={setDetails} isOptional />
      <Grid columns={2} gap={3}>
        <NumberInput
          label="Price"
          value={price}
          onChange={setPrice}
          min={0}
          step={0.01}
          units="dollars"
        />
        <NumberInput
          label="Stock"
          value={stock}
          onChange={setStock}
          min={0}
          isIntegerOnly
        />
      </Grid>
      <TextInput
        label="Image URLs"
        description="Separate URLs with commas."
        value={images}
        onChange={setImages}
        isOptional
      />
      <Selector
        label="Category"
        placeholder="No category"
        value={categoryId}
        onChange={(value) => setCategoryId(value ?? "")}
        hasClear
        options={categories.map((category) => ({ value: category.id, label: category.name }))}
        isOptional
      />
      <HStack gap={4} wrap="wrap">
        <Switch label="Active" value={isActive} onChange={setIsActive} />
        <Switch label="Featured" value={isFeatured} onChange={setIsFeatured} />
      </HStack>
      <Button label={product ? "Save product" : "Create product"} isLoading={isSaving} onClick={saveProduct} />
    </VStack>
  );
}
