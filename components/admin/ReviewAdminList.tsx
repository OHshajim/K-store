"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { List, ListItem } from "@astryxdesign/core/List";
import { Heading, Text } from "@astryxdesign/core/Text";
import { StarRating } from "@/components/shared/StarRating";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";

export function ReviewAdminList({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggle(review: Review) {
    setBusyId(review.id);
    await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: !review.is_published }),
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>Reviews</Heading>
        <Text type="body" color="secondary">
          Moderate customer reviews. Hidden reviews stay visible to admins only.
        </Text>
      </VStack>
      <List header="All reviews" hasDividers>
        {reviews.map((review) => (
          <ListItem
            key={review.id}
            label={review.product?.name ?? "Product"}
            description={
              <VStack gap={1}>
                <HStack gap={2} vAlign="center">
                  <StarRating value={review.rating} />
                  <Text type="supporting" color="secondary">
                    {review.reviewer_name ?? review.user_id.slice(0, 8)} ·{" "}
                    {formatDate(review.created_at)}
                  </Text>
                </HStack>
                {review.comment && <Text type="body">{review.comment}</Text>}
              </VStack>
            }
            endContent={
              <VStack gap={2} hAlign="end">
                <Badge
                  label={review.is_published ? "Published" : "Hidden"}
                  variant={review.is_published ? "success" : "warning"}
                />
                <Button
                  label={
                    review.is_published
                      ? "Hide this review"
                      : "Publish this review"
                  }
                  variant="ghost"
                  size="sm"
                  isDisabled={busyId === review.id}
                  onClick={() => toggle(review)}
                />
              </VStack>
            }
          />
        ))}
      </List>
    </VStack>
  );
}
