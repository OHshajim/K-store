"use client";

import { useState } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Dialog } from "@astryxdesign/core/Dialog";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { StarRating } from "@/components/shared/StarRating";

export function ReviewForm({
  productId,
  orderId,
  productName,
}: {
  productId: string;
  orderId: string;
  productName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (rating < 1) {
      setError("Pick a star rating first.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, orderId, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit review");
      setIsOpen(false);
      window.location.reload();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to submit review",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button label="Write a review" variant="secondary" size="sm" onClick={() => setIsOpen(true)} />
      <Dialog
        isOpen={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        purpose="form"
      >
        <VStack gap={3}>
          <Text type="large" weight="bold">
            Review {productName}
          </Text>
          {error && (
            <Banner status="error" title="Review not submitted" description={error} />
          )}
          <Text type="body" color="secondary">
            How was {productName}?
          </Text>
          <StarRating value={rating} onChange={setRating} />
          <TextArea
            label="Your review"
            placeholder="What did you like? How does it hold up in daily use?"
            value={comment}
            onChange={setComment}
            isOptional
          />
          <Button
            label="Submit review"
            variant="primary"
            isLoading={isSubmitting}
            onClick={submit}
          />
        </VStack>
      </Dialog>
    </>
  );
}
