import { Card } from "@astryxdesign/core/Card";
import { Heading, Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { getStoreSettings } from "@/lib/data/catalog";

export const revalidate = 300;

export const metadata = { title: "Terms & conditions" };

export default async function TermsPage() {
  const settings = await getStoreSettings();

  return (
    <VStack gap={4} maxWidth={720}>
      <VStack gap={1}>
        <Heading level={1}>Terms &amp; conditions</Heading>
        <Text type="body" color="secondary">
          The essentials of ordering from {settings?.store_name ?? "our store"}.
        </Text>
      </VStack>
      <Card padding={5}>
        <Text type="body">
          {settings?.terms_html ||
            "Terms have not been published yet — please check back soon."}
        </Text>
      </Card>
    </VStack>
  );
}
