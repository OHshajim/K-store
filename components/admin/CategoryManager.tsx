"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Dialog } from "@astryxdesign/core/Dialog";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { List, ListItem } from "@astryxdesign/core/List";
import { NumberInput } from "@astryxdesign/core/NumberInput";
import { Heading, Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { Category } from "@/lib/types";

type Draft = { name: string; description: string; sort_order: number };

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setDraft({ name: "", description: "", sort_order: categories.length + 1 });
    setIsCreating(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setDraft({
      name: category.name,
      description: category.description ?? "",
      sort_order: category.sort_order,
    });
    setIsCreating(false);
  }

  async function save() {
    if (!draft) return;
    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch(
        isCreating
          ? "/api/admin/categories"
          : `/api/admin/categories/${editing!.id}`,
        {
          method: isCreating ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
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

  async function remove(category: Category) {
    setError(null);
    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Unable to delete");
      return;
    }
    router.refresh();
  }

  return (
    <VStack gap={4}>
      {error && <Banner status="error" title="Action failed" description={error} />}
      <HStack hAlign="between" vAlign="center">
        <VStack gap={1}>
          <Heading level={1}>Categories</Heading>
          <Text type="body" color="secondary">
            Group products into collections customers can browse.
          </Text>
        </VStack>
        <Button label="Add category" variant="primary" onClick={openCreate} />
      </HStack>

      <List header="Categories" hasDividers>
        {categories.map((category) => (
          <ListItem
            key={category.id}
            label={category.name}
            description={category.description ?? undefined}
            endContent={
              <HStack gap={2}>
                <Button
                  label={`Edit ${category.name}`}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<PencilSquareIcon />}
                  onClick={() => openEdit(category)}
                />
                <Button
                  label={`Delete ${category.name}`}
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  icon={<TrashIcon />}
                  onClick={() => remove(category)}
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
              {isCreating ? "New category" : "Edit category"}
            </Text>
            <TextInput
              label="Name"
              value={draft.name}
              onChange={(name) => setDraft({ ...draft, name })}
              isRequired
            />
            <TextArea
              label="Description"
              value={draft.description}
              onChange={(description) => setDraft({ ...draft, description })}
              isOptional
            />
            <NumberInput
              label="Sort order"
              value={draft.sort_order}
              onChange={(sort_order) =>
                setDraft({ ...draft, sort_order: sort_order ?? 0 })
              }
              isIntegerOnly
            />
            <Button
              label={isCreating ? "Create category" : "Save changes"}
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
