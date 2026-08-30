import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Layout";
import { Heading, Text } from "@astryxdesign/core/Text";
import { MetadataList, MetadataListItem } from "@astryxdesign/core/MetadataList";
import { getStoreSettings } from "@/lib/data/catalog";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <VStack gap={4} maxWidth={720}>
      <VStack gap={1}>
        <Heading level={1}>Store settings</Heading>
        <Text type="body" color="secondary">
          Payment and delivery instructions shown at checkout. Edit via the
          `store_settings` table in Supabase (kept simple for the free tier).
        </Text>
      </VStack>
      <Card padding={4}>
        <MetadataList>
          <MetadataListItem label="Store">{settings.store_name}</MetadataListItem>
          <MetadataListItem label="Currency">
            {settings.currency}
          </MetadataListItem>
          <MetadataListItem label="Flat shipping">
            {(settings.shipping_flat_cents / 100).toFixed(2)}
          </MetadataListItem>
          <MetadataListItem label="Bank">
            {settings.bank_name || "—"} · {settings.bank_account_number || "—"}
          </MetadataListItem>
          <MetadataListItem label="Mobile money">
            {settings.mobile_money_number || "—"}
          </MetadataListItem>
          <MetadataListItem label="Payment instructions">
            {settings.payment_instructions}
          </MetadataListItem>
          <MetadataListItem label="Delivery notes">
            {settings.delivery_notes}
          </MetadataListItem>
        </MetadataList>
      </Card>
    </VStack>
  );
}
