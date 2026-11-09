import { getOrderByTracking } from "@/lib/data/orders";
import { getStoreSettings } from "@/lib/data/catalog";
import { OrderDetailView } from "@/components/store/OrderDetailView";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Button } from "@astryxdesign/core/Button";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

type Params = Promise<{ orderNumber: string }>;
type SearchParams = Promise<{ t?: string }>;

// Guest tracking: the email link carries a one-order secret token. No login,
// no session — the token is the capability. Logged-in customers use /orders.
export default async function TrackOrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { orderNumber } = await params;
  const { t } = await searchParams;
  const [order, settings] = await Promise.all([
    getOrderByTracking(orderNumber, t ?? ""),
    getStoreSettings(),
  ]);

  if (!order || !settings) {
    return (
      <EmptyState
        title="Tracking link not valid"
        description="This link is missing its tracking token or has expired. Check the email for the latest link, or contact support."
        icon={<QuestionMarkCircleIcon />}
        actions={<Button label="Back to shop" href="/" variant="primary" />}
      />
    );
  }

  return (
    <OrderDetailView order={order} settings={settings} trackingToken={t} />
  );
}
