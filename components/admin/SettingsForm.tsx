"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading, Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import type { StoreSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [draft, setDraft] = useState({
    store_name: settings.store_name,
    tagline: settings.tagline,
    support_email: settings.support_email ?? "",
    currency: settings.currency,
    currency_symbol: settings.currency_symbol,
    shipping_dollars: String(settings.shipping_flat_cents / 100),
    free_shipping_dollars:
      settings.free_shipping_over_cents === null
        ? ""
        : String(settings.free_shipping_over_cents / 100),
    delivery_notes: settings.delivery_notes,
    about_html: settings.about_html ?? "",
    terms_html: settings.terms_html ?? "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function set<K extends keyof typeof draft>(key: K, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setError(null);
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_name: draft.store_name,
          tagline: draft.tagline,
          support_email: draft.support_email || null,
          currency: draft.currency,
          currency_symbol: draft.currency_symbol,
          shipping_flat_cents: Math.round(Number(draft.shipping_dollars) * 100) || 0,
          free_shipping_over_cents: draft.free_shipping_dollars
            ? Math.round(Number(draft.free_shipping_dollars) * 100)
            : null,
          delivery_notes: draft.delivery_notes,
          about_html: draft.about_html || null,
          terms_html: draft.terms_html || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <VStack gap={4} maxWidth={720}>
      <VStack gap={1}>
        <Heading level={1}>Store settings</Heading>
        <Text type="body" color="secondary">
          Shown across the storefront — home page, checkout, and legal pages.
        </Text>
      </VStack>

      {error && <Banner status="error" title="Save failed" description={error} />}

      <Card padding={4}>
        <VStack gap={3}>
          <Text type="large" weight="bold">
            Identity
          </Text>
          <TextInput
            label="Store name"
            value={draft.store_name}
            onChange={(value) => set("store_name", value)}
            isRequired
          />
          <TextInput
            label="Tagline"
            value={draft.tagline}
            onChange={(value) => set("tagline", value)}
            isRequired
          />
          <TextInput
            label="Support email"
            type="email"
            value={draft.support_email}
            onChange={(value) => set("support_email", value)}
            isOptional
          />
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Text type="large" weight="bold">
            Currency &amp; delivery
          </Text>
          <Grid columns={2} gap={3}>
            <TextInput
              label="Currency code"
              value={draft.currency}
              onChange={(value) => set("currency", value)}
              isRequired
            />
            <TextInput
              label="Symbol"
              value={draft.currency_symbol}
              onChange={(value) => set("currency_symbol", value)}
              isRequired
            />
            <TextInput
              label="Flat delivery fee"
              value={draft.shipping_dollars}
              onChange={(value) => set("shipping_dollars", value)}
              isRequired
            />
            <TextInput
              label="Free delivery over"
              value={draft.free_shipping_dollars}
              onChange={(value) => set("free_shipping_dollars", value)}
              isOptional
            />
          </Grid>
          <TextArea
            label="Delivery notes"
            value={draft.delivery_notes}
            onChange={(value) => set("delivery_notes", value)}
          />
        </VStack>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          <Text type="large" weight="bold">
            Pages
          </Text>
          <TextArea
            label="About page (HTML allowed)"
            rows={5}
            value={draft.about_html}
            onChange={(value) => set("about_html", value)}
            isOptional
          />
          <TextArea
            label="Terms & conditions (HTML allowed)"
            rows={5}
            value={draft.terms_html}
            onChange={(value) => set("terms_html", value)}
            isOptional
          />
        </VStack>
      </Card>

      <Button
        label="Save settings"
        variant="primary"
        size="lg"
        isLoading={isSaving}
        onClick={save}
      />
    </VStack>
  );
}
