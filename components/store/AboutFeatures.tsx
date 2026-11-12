import {
  CreditCard,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { FeatureCard } from "@/components/shared/FeatureCard";

export function AboutFeatures() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <FeatureCard
        icon={ShieldCheck}
        title="Manual payment & Verification"
        description="Pay by bank transfer or card with instant verification before hand-packaging."
      />
      <FeatureCard
        icon={Truck}
        title="White-Glove Delivery"
        description="We dispatch each essential in protective crates with real-time status milestones."
      />
      <FeatureCard
        icon={CreditCard}
        title="Encrypted Checkout"
        description="Industry-standard TLS encryption ensures your details remain private."
      />
    </div>
  );
}
