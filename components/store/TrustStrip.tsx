"use client";

import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { Grid } from "@astryxdesign/core/Grid";
import {
  EnvelopeIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

/**
 * Trust signals under the hero: how delivery works, how payments are
 * verified, and where help comes from (a real inbox, not a bot).
 */
export function TrustStrip({ supportEmail }: { supportEmail: string | null }) {
  const features = [
    {
      icon: TruckIcon,
      title: "Delivered by hand",
      description:
        "In our local service area — no couriers, no lost parcels.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Confirmed by a human",
      description:
        "Every payment verified personally within 24 hours, with email updates at each step.",
    },
    {
      icon: EnvelopeIcon,
      title: "Talk to a person",
      description: supportEmail
        ? `Questions about an order? Email ${supportEmail} — a person replies.`
        : "Questions about an order? Email us — a person replies.",
    },
  ];

  return (
    <Grid columns={{ minWidth: 280, repeat: "fit" }} gap={3}>
      {features.map((feature) => (
        <Card key={feature.title} padding={4}>
          <HStack gap={3} vAlign="center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-muted)]">
              <Icon icon={feature.icon} size="sm" color="accent" />
            </div>
            <VStack gap={0}>
              <Text type="label" weight="bold">
                {feature.title}
              </Text>
              <Text type="supporting" color="secondary">
                {feature.description}
              </Text>
            </VStack>
          </HStack>
        </Card>
      ))}
    </Grid>
  );
}
