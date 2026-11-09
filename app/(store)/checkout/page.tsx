import { getCurrentProfile } from "@/lib/data/auth";
import { requireStoreSettings } from "@/lib/data/catalog";
import { CheckoutForm } from "@/components/store/CheckoutForm";

// Guests check out here too — the form collects contact details and the
// order confirmation email carries a tracking link.
export default async function CheckoutPage() {
  const [settings, profile] = await Promise.all([
    requireStoreSettings(),
    getCurrentProfile(),
  ]);

  return (
    <CheckoutForm
      settings={settings}
      userEmail={profile?.email}
      userName={profile?.full_name}
    />
  );
}
