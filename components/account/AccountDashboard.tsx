"use client";

import { useState } from "react";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { List, ListItem } from "@astryxdesign/core/List";
import { TabList, Tab } from "@astryxdesign/core/TabList";
import { Heading, Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ReviewForm } from "@/components/store/ReviewForm";
import { StarRating } from "@/components/shared/StarRating";
import { PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import type { Profile, Review } from "@/lib/types";

export type AccountOrder = {
  id: string;
  order_number: string;
  payment_status: keyof typeof PAYMENT_STATUS_LABELS;
  total_cents: number;
};

export type ReviewableItem = {
  orderId: string;
  orderNumber: string;
  productId: string;
  productName: string;
};

export function AccountDashboard({
  profile,
  orders,
  reviewable,
  reviews,
  showResetNotice,
}: {
  profile: Profile;
  orders: AccountOrder[];
  reviewable: ReviewableItem[];
  reviews: Review[];
  showResetNotice: boolean;
}) {
  const [tab, setTab] = useState("profile");

  return (
    <VStack gap={4} maxWidth={760}>
      <HStack gap={3} hAlign="between" vAlign="center">
        <VStack gap={1}>
          <Heading level={1}>Account</Heading>
          <Text type="body" color="secondary">
            {profile.email} · {profile.role}
          </Text>
        </VStack>
        <HStack gap={2}>
          {profile.role === "admin" && (
            <Button label="Store admin" href="/admin" variant="secondary" />
          )}
          <LogoutButton />
        </HStack>
      </HStack>

      {showResetNotice && (
        <Banner
          status="success"
          title="Reset link verified"
          description="Set your new password below in the Security tab."
        />
      )}

      <TabList value={tab} onChange={setTab} layout="fill" hasDivider>
        <Tab value="profile" label="Profile" />
        <Tab value="security" label="Security" />
        <Tab value="orders" label={`Orders (${orders.length})`} />
        <Tab value="reviews" label={`Reviews (${reviewable.length})`} />
      </TabList>

      {tab === "profile" && <ProfileForm profile={profile} />}
      {tab === "security" && <SecurityForm />}
      {tab === "orders" && <OrdersPanel orders={orders} />}
      {tab === "reviews" && (
        <ReviewsPanel reviewable={reviewable} reviews={reviews} />
      )}
    </VStack>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setError(null);
    setNotice(null);
    setIsSaving(true);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save");
      setNotice("Profile updated.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card padding={4}>
      <VStack gap={3}>
        {error && <Banner status="error" title="Save failed" description={error} />}
        {notice && <Banner status="success" title="Saved" description={notice} />}
        <TextInput
          label="Full name"
          value={fullName}
          onChange={setFullName}
          isRequired
        />
        <TextInput
          label="Phone"
          value={phone}
          onChange={setPhone}
          isOptional
        />
        <VStack gap={2} hAlign="start">
          <Button label="Save profile" variant="primary" isLoading={isSaving} onClick={save} />
        </VStack>
      </VStack>
    </Card>
  );
}

function SecurityForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setError(null);
    setNotice(null);
    setIsSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;
      setPassword("");
      setNotice("Password updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card padding={4}>
      <VStack gap={3}>
        {error && <Banner status="error" title="Update failed" description={error} />}
        {notice && <Banner status="success" title="Saved" description={notice} />}
        <Text type="body" color="secondary">
          Choose a password of at least 8 characters. Google sign-in users can
          still set a password for email access.
        </Text>
        <TextInput
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          isRequired
        />
        <VStack gap={2} hAlign="start">
          <Button
            label="Update password"
            variant="primary"
            isDisabled={password.length < 8}
            isLoading={isSaving}
            onClick={save}
          />
        </VStack>
      </VStack>
    </Card>
  );
}

function OrdersPanel({ orders }: { orders: AccountOrder[] }) {
  if (!orders.length) {
    return (
      <Card padding={4}>
        <VStack gap={2}>
          <Text type="body">No orders yet.</Text>
          <Button label="Start shopping" href="/shop" variant="primary" />
        </VStack>
      </Card>
    );
  }

  return (
    <List header="Your orders" hasDividers>
      {orders.map((order) => (
        <ListItem
          key={order.id}
          label={order.order_number}
          description={PAYMENT_STATUS_LABELS[order.payment_status]}
          href={`/orders/${order.id}`}
          endContent={
            <Text type="body" weight="bold">
              {formatMoney(order.total_cents)}
            </Text>
          }
        />
      ))}
    </List>
  );
}

function ReviewsPanel({
  reviewable,
  reviews,
}: {
  reviewable: ReviewableItem[];
  reviews: Review[];
}) {
  return (
    <VStack gap={4}>
      {reviewable.length > 0 && (
        <Card padding={4} variant="muted">
          <VStack gap={3}>
            <Text type="large" weight="bold">
              To review
            </Text>
            <List density="compact" hasDividers>
              {reviewable.map((item) => (
                <ListItem
                  key={`${item.orderId}-${item.productId}`}
                  label={item.productName}
                  description={`Order ${item.orderNumber}`}
                  endContent={
                    <ReviewForm
                      productId={item.productId}
                      orderId={item.orderId}
                      productName={item.productName}
                    />
                  }
                />
              ))}
            </List>
          </VStack>
        </Card>
      )}

      <VStack gap={2}>
        <Text type="large" weight="bold">
          Your reviews
        </Text>
        {reviews.length === 0 ? (
          <Text type="body" color="secondary">
            Nothing reviewed yet.
          </Text>
        ) : (
          <List density="compact" hasDividers>
            {reviews.map((review) => (
              <ListItem
                key={review.id}
                label={review.product?.name ?? "Product"}
                description={
                  <HStack gap={2} vAlign="center">
                    <StarRating value={review.rating} />
                    {review.comment && (
                      <Text type="supporting" color="secondary">
                        {review.comment}
                      </Text>
                    )}
                  </HStack>
                }
                href={`/product/${review.product?.slug ?? ""}`}
              />
            ))}
          </List>
        )}
      </VStack>
    </VStack>
  );
}
