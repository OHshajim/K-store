import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/Layout";
import { Heading, Text } from "@astryxdesign/core/Text";

export default function OfflinePage() {
  return (
    <Center axis="both" minHeight="100dvh">
      <Card padding={5}>
        <VStack gap={2} hAlign="center">
          <Heading level={1}>You are offline</Heading>
          <Text type="body" color="secondary">
            Reconnect to browse the catalog and place orders. Cached pages may
            still be available.
          </Text>
        </VStack>
      </Card>
    </Center>
  );
}
