"use client";

import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack } from "@astryxdesign/core/HStack";
import { MediaTheme } from "@astryxdesign/core/theme";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";

// Plain inline styles with Astryx token variables (no StyleX compiler in
// this project — same approach as the official checkout reference).
const heroRelative: CSSProperties = { position: "relative" };

const imageCover: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const overlayGradient: CSSProperties = {
  position: "relative",
  padding: "var(--spacing-6)",
  paddingBlockStart: "calc(var(--spacing-10) * 3)",
  backgroundImage:
    "linear-gradient(to top, rgb(0 0 0 / 0.66), rgb(0 0 0 / 0.24) 55%, rgb(0 0 0 / 0))",
};

export function HomeHero({
  storeName,
  tagline,
  image,
}: {
  storeName: string;
  tagline: string;
  image?: string;
}) {
  const router = useRouter();

  if (!image) {
    return (
      <Card padding={6} variant="muted">
        <VStack gap={4} maxWidth={560}>
          <VStack gap={2}>
            <Text type="display-1" as="h1">
              {storeName}
            </Text>
            <Text type="large" color="secondary">
              {tagline}
            </Text>
          </VStack>
          <HStack gap={2} wrap="wrap">
            <Button
              label="Shop the collection"
              variant="primary"
              size="lg"
              onClick={() => router.push("/shop")}
            />
          </HStack>
        </VStack>
      </Card>
    );
  }

  return (
    <Card padding={0} elevation="low">
      <VStack style={heroRelative}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" style={imageCover} />
        <MediaTheme mode="dark">
          <VStack gap={4} style={overlayGradient}>
            <VStack gap={2} maxWidth={560}>
              <Text type="display-1" as="h1">
                {storeName}
              </Text>
              <Text type="large">{tagline}</Text>
            </VStack>
            <HStack gap={2} wrap="wrap">
              <Button
                label="Shop the collection"
                variant="primary"
                size="lg"
                onClick={() => router.push("/shop")}
              />
              <Button
                label="Our story"
                variant="ghost"
                size="lg"
                onClick={() => router.push("/about")}
              />
            </HStack>
          </VStack>
        </MediaTheme>
      </VStack>
    </Card>
  );
}
