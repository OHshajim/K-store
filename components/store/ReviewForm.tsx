"use client";

import { useState } from "react";
import { Star, X, AlertCircle, MessageSquare } from "lucide-react";

export function ReviewForm({
  productId,
  orderId,
  productName,
}: {
  productId: string;
  orderId: string;
  productName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (rating < 1) {
      setError("Please select a star rating first.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, orderId, rating, comment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit review");
      setIsOpen(false);
      window.location.reload();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to submit review"
      );
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#1A1C18]/15 bg-white text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors shadow-2xs cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5 text-[#B78E69]" />
        <span>Write a Review</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#1A1C18]/10 shadow-2xl space-y-6 relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-[#4A483E]/60 hover:text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#B78E69] font-bold">
                Verified Customer Feedback
              </span>
              <h3 className="font-editorial text-2xl font-bold text-[#1A1C18] mt-1">
                Review: {productName}
              </h3>
              <p className="text-xs text-[#4A483E]/80 mt-1 font-sans">
                How does this essential perform in your daily living space? Share your experience with future patrons.
              </p>
            </div>

            {/* Error notice */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Interactive Star Picker */}
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#1A1C18]/10 space-y-2 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A483E] block font-sans">
                Your Rating
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const activeStar = hoverRating || rating;
                  const isFilled = star <= activeStar;

                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? "text-[#B78E69] fill-[#B78E69]"
                            : "text-[#1A1C18]/20 fill-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-mono font-bold text-[#B78E69] block">
                {rating === 5
                  ? "5 / 5 · Exceptional Craft"
                  : rating === 4
                  ? "4 / 5 · Very Good"
                  : rating === 3
                  ? "3 / 5 · Good"
                  : rating === 2
                  ? "2 / 5 · Fair"
                  : "1 / 5 · Needs Improvement"}
              </span>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs font-bold text-[#1A1C18] uppercase tracking-wider mb-2 font-sans">
                Your Written Reflection
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What do you appreciate about the materials, joinery, and daily function? How does it look in your room?"
                className="w-full px-4 py-3 bg-[#FDFBF7] border border-[#1A1C18]/15 rounded-2xl text-xs sm:text-sm text-[#1A1C18] placeholder:text-[#4A483E]/40 focus:outline-none focus:ring-2 focus:ring-[#B78E69]/30 focus:border-[#B78E69] transition-all resize-y"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#1A1C18]/15 text-xs font-semibold text-[#1A1C18] hover:bg-[#F4F0E8] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={submit}
                data-btn="dark"
                style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
                className="px-6 py-2.5 rounded-xl bg-[#1A1C18] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#32362F] transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <span style={{ color: "#FFFFFF" }}>
                  {isSubmitting ? "Publishing…" : "Publish Review"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
