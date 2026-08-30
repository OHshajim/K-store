"use client";

import { Grid } from "@astryxdesign/core/Grid";
import {
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { FeatureCard } from "@/components/shared/FeatureCard";

export function AboutFeatures() {
  return (
    <Grid columns={{ minWidth: 240, repeat: "fit" }} gap={4}>
      <FeatureCard
        icon={ShieldCheckIcon}
        title="Manual payment"
        description="Pay by bank transfer, mobile money, or cash on delivery. Upload proof after checkout and we confirm before packing."
      />
      <FeatureCard
        icon={TruckIcon}
        title="Hand delivery"
        description="We deliver each order personally and update status in your order history as it moves."
      />
      <FeatureCard
        icon={CreditCardIcon}
        title="Secure checkout"
        description="We never collect card numbers. Your details stay between you and the vendor."
      />
    </Grid>
  );
}
