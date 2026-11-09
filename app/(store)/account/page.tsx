import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import { getOrdersForUser } from "@/lib/data/orders";
import { getReviewableProducts, getUserReviews } from "@/lib/data/reviews";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/account");

  const { reset } = await searchParams;
  const [orders, reviewable, reviews] = await Promise.all([
    getOrdersForUser(profile.id),
    getReviewableProducts(profile.id),
    getUserReviews(profile.id),
  ]);

  return (
    <AccountDashboard
      profile={profile}
      showResetNotice={reset === "1"}
      orders={orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        payment_status: order.payment_status,
        total_cents: order.total_cents,
      }))}
      reviewable={reviewable}
      reviews={reviews}
    />
  );
}
