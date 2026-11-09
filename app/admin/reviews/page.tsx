import { ReviewAdminList } from "@/components/admin/ReviewAdminList";
import { getAllReviews } from "@/lib/data/reviews";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return <ReviewAdminList reviews={reviews} />;
}
