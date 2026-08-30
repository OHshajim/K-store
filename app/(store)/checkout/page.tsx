import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { getStoreSettings } from "@/lib/data/catalog";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export default async function CheckoutPage() {
  const [settings, profile] = await Promise.all([
    getStoreSettings(),
    getCurrentProfile(),
  ]);

  if (!profile) {
    redirect("/login?next=/checkout");
  }

  return (
    <CheckoutForm
      settings={settings}
      userEmail={profile.email}
      userName={profile.full_name}
    />
  );
}
