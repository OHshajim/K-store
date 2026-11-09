"use client";

import { useEffect, useState } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Icon } from "@astryxdesign/core/Icon";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useRouter } from "next/navigation";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { Banner } from "@/lib/types";

const AUTO_ADVANCE_MS = 6000;

/**
 * Admin-managed hero slider (banners with placement=hero): crossfade slides
 * with dots and arrows, auto-advancing. With no banners configured it falls
 * back to a quiet intro card so the home page never renders an empty block.
 */
export function HeroSlider({
  slides,
  storeName,
  tagline,
}: {
  slides: Banner[];
  storeName: string;
  tagline: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      AUTO_ADVANCE_MS,
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
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
          <VStack gap={2} hAlign="start">
            <Button
              label="Shop the collection"
              variant="primary"
              size="lg"
              onClick={() => router.push("/shop")}
            />
          </VStack>
        </VStack>
      </Card>
    );
  }

  return (
    <div className="relative h-96 w-full overflow-hidden rounded-xl">
      {slides.map((slide, slideIndex) => (
        <div
          key={slide.id}
          aria-hidden={slideIndex !== index}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: slideIndex === index ? 1 : 0 }}
        >
          {slide.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.image_url}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,12,6,0.82)] via-[rgba(20,12,6,0.42)] to-transparent" />
          <div className="absolute inset-0 flex items-end p-6 sm:p-8">
            <VStack gap={3} maxWidth={560}>
              <VStack gap={2}>
                <VStack gap={0} hAlign="start">
                  <Badge label="Featured" variant="orange" />
                </VStack>
                <Text type="display-2" as="h2" className="!text-[var(--color-on-dark)]">
                  {slide.title}
                </Text>
                {slide.subtitle && (
                  <Text type="large" className="!text-[var(--color-on-dark)]">
                    {slide.subtitle}
                  </Text>
                )}
              </VStack>
              {slide.cta_label && slide.cta_href && (
                <VStack gap={2} hAlign="start">
                  <Button
                    label={slide.cta_label}
                    variant="primary"
                    size="lg"
                    onClick={() => router.push(slide.cta_href!)}
                  />
                </VStack>
              )}
            </VStack>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, dotIndex) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${dotIndex + 1}: ${slide.title}`}
                onClick={() => setIndex(dotIndex)}
                className={`h-2 cursor-pointer rounded-full p-0 transition-all ${
                  dotIndex === index
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
          <div className="absolute inset-y-0 right-3 flex items-center">
            <IconButton
              label="Next slide"
              variant="secondary"
              icon={<Icon icon={ChevronRightIcon} size="sm" />}
              onClick={() => setIndex((index + 1) % slides.length)}
            />
          </div>
          <div className="absolute inset-y-0 left-3 flex items-center">
            <IconButton
              label="Previous slide"
              variant="secondary"
              icon={<Icon icon={ChevronLeftIcon} size="sm" />}
              onClick={() =>
                setIndex((index - 1 + slides.length) % slides.length)
              }
            />
          </div>
        </>
      )}
    </div>
  );
}
