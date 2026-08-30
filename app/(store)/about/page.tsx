import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { getStoreSettings } from "@/lib/data/catalog";
import { AboutFeatures } from "@/components/store/AboutFeatures";

export const revalidate = 300;

export default async function AboutPage() {
  const settings = await getStoreSettings();

  return (
    <VStack gap={6}>
      <VStack gap={2}>
        <Text type="display-1" as="h1">
          About {settings.store_name}
        </Text>
        <Text type="large" color="secondary">
          {settings.tagline}
        </Text>
      </VStack>

      <Card padding={5}>
        <VStack gap={3}>
          <Text type="body">
            {settings.about_html ||
              "A single-vendor shop with manual payment confirmation and hand delivery."}
          </Text>
          <Text type="body" color="secondary">
            {settings.delivery_notes}
          </Text>
          {settings.support_email && (
            <HStack gap={2} vAlign="center">
              <EnvelopeIcon className="size-5 shrink-0" aria-hidden="true" />
              <Text type="body">Support: {settings.support_email}</Text>
            </HStack>
          )}
        </VStack>
      </Card>

      <Divider />

      <AboutFeatures />
    </VStack>
  );
}
