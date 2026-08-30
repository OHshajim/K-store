"use client";

import { Card } from "@astryxdesign/core/Card";
import { Icon, type IconType } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: IconType;
  title: string;
  description: string;
}) {
  return (
    <Card padding={4} variant="muted">
      <VStack gap={2}>
        <Icon icon={icon} size="md" />
        <Text type="large" weight="bold">
          {title}
        </Text>
        <Text type="body" color="secondary">
          {description}
        </Text>
      </VStack>
    </Card>
  );
}
