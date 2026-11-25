import { getAdminCoupons } from "@/lib/data/coupons";
import { CouponManager } from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promotional Coupons & Campaigns | Kstore Admin",
  description: "Manage checkout promo codes and promotional discount vouchers.",
};

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <CouponManager initialCoupons={coupons} />
    </div>
  );
}
