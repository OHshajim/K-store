"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Dialog } from "@astryxdesign/core/Dialog";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { List, ListItem } from "@astryxdesign/core/List";
import { Badge } from "@astryxdesign/core/Badge";
import { Heading, Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { Banner as BannerType } from "@/lib/types";
import { ImageUploadInput } from "@/components/admin/ImageUploadInput";

type Draft = {
  placement: "hero" | "promo";
  title: string;
  subtitle: string;
  image_url: string;
  cta_label: string;
  cta_href: string;
  sort_order: number;
  is_active: boolean;
};

const emptyDraft: Draft = {
  placement: "hero",
  title: "",
  subtitle: "",
  image_url: "",
  cta_label: "",
  cta_href: "",
  sort_order: 0,
  is_active: true,
};

export function BannerManager({ banners }: { banners: BannerType[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<BannerType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setDraft({ ...emptyDraft, sort_order: banners.length + 1 });
    setIsCreating(true);
  }

  function openEdit(banner: BannerType) {
    setEditing(banner);
    setDraft({
      placement: banner.placement,
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      image_url: banner.image_url ?? "",
      cta_label: banner.cta_label ?? "",
      cta_href: banner.cta_href ?? "",
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
    setIsCreating(false);
  }

  async function save() {
    if (!draft) return;
    setError(null);
    setIsSaving(true);
    try {
      const payload = {
        ...draft,
        subtitle: draft.subtitle || null,
        image_url: draft.image_url || null,
        cta_label: draft.cta_label || null,
        cta_href: draft.cta_href || null,
      };
      const response = await fetch(
        isCreating ? "/api/admin/banners" : `/api/admin/banners/${editing!.id}`,
        {
          method: isCreating ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save");
      setDraft(null);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove(banner: BannerType) {
    const response = await fetch(`/api/admin/banners/${banner.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Unable to delete");
      return;
    }
    router.refresh();
  }

  async function toggleActive(banner: BannerType) {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !banner.is_active }),
    });
    router.refresh();
  }

  return (
    <VStack gap={4}>
      {error && <Banner status="error" title="Action failed" description={error} />}
      <HStack hAlign="between" vAlign="center">
        <VStack gap={1}>
          <Heading level={1}>Banners</Heading>
          <Text type="body" color="secondary">
            Hero slides rotate on the home page; promo banners sit above it.
          </Text>
        </VStack>
        <Button
          label="Add banner"
          variant="primary"
          icon={<PlusIcon />}
          onClick={openCreate}
        />
      </HStack>

      <List header="All banners" hasDividers>
        {banners.map((banner) => (
          <ListItem
            key={banner.id}
            label={banner.title}
            description={
              banner.placement === "hero" ? "Home hero slider" : "Promo banner"
            }
            endContent={
              <HStack gap={2} vAlign="center">
                <Badge
                  label={banner.is_active ? "Active" : "Hidden"}
                  variant={banner.is_active ? "success" : "neutral"}
                />
                <Button
                  label={banner.is_active ? `Hide ${banner.title}` : `Show ${banner.title}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleActive(banner)}
                />
                <Button
                  label={`Edit ${banner.title}`}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<PencilSquareIcon />}
                  onClick={() => openEdit(banner)}
                />
                <Button
                  label={`Delete ${banner.title}`}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<TrashIcon />}
                  onClick={() => remove(banner)}
                />
              </HStack>
            }
          />
        ))}
      </List>

      {draft && (
        <Dialog
          isOpen
          onOpenChange={(open) => !open && setDraft(null)}
          purpose="form"
        >
          <VStack gap={3}>
            <Text type="large" weight="bold">
              {isCreating ? "New banner" : "Edit banner"}
            </Text>
            <HStack gap={3}>
              <Button
                label={draft.placement === "hero" ? "Type: Hero slide" : "Type: Promo banner"}
                variant="secondary"
                onClick={() =>
                  setDraft({
                    ...draft,
                    placement: draft.placement === "hero" ? "promo" : "hero",
                  })
                }
              />
              <Button
                label={draft.is_active ? "Active" : "Hidden"}
                variant="ghost"
                onClick={() => setDraft({ ...draft, is_active: !draft.is_active })}
              />
            </HStack>
            <TextInput
              label="Title"
              value={draft.title}
              onChange={(title) => setDraft({ ...draft, title })}
              isRequired
            />
            <TextInput
              label="Subtitle"
              value={draft.subtitle}
              onChange={(subtitle) => setDraft({ ...draft, subtitle })}
              isOptional
            />
            {draft.placement === "hero" && (
              <ImageUploadInput
                bucket="banners"
                label="Slide image"
                value={draft.image_url}
                onChange={(image_url) => setDraft({ ...draft, image_url })}
              />
            )}
            {draft.placement === "hero" && (
              <HStack gap={3}>
                <TextInput
                  label="Button label"
                  value={draft.cta_label}
                  onChange={(cta_label) => setDraft({ ...draft, cta_label })}
                  isOptional
                />
                <TextInput
                  label="Button link"
                  value={draft.cta_href}
                  onChange={(cta_href) => setDraft({ ...draft, cta_href })}
                  isOptional
                />
              </HStack>
            )}
            <Button
              label={isCreating ? "Create banner" : "Save changes"}
              variant="primary"
              isLoading={isSaving}
              onClick={save}
            />
          </VStack>
        </Dialog>
      )}
    </VStack>
  );
}
