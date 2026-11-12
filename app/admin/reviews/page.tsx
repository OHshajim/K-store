import { ReviewAdminList } from "@/components/admin/ReviewAdminList";
import { getAllReviews } from "@/lib/data/reviews";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <ReviewAdminList reviews={reviews} />
    </div>
  );
}
