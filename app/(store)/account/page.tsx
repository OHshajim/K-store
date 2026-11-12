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
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto min-h-[75vh]">
      <AccountDashboard
        profile={profile}
        showResetNotice={reset === "1"}
        orders={orders.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          payment_status: order.payment_status,
          delivery_status: order.delivery_status,
          total_cents: order.total_cents,
          created_at: order.created_at,
          item_count: order.items?.length ?? 1,
        }))}
        reviewable={reviewable}
        reviews={reviews}
      />
    </div>
  );
}
