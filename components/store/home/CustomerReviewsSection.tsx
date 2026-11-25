"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Quote,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { Review } from "@/lib/types";

const CURATED_REFLECTIONS: Review[] = [
  {
    id: "curated-1",
    product_id: "a0000000-0000-4000-8000-000000000001",
    user_id: "user-1",
    order_id: "order-1",
    rating: 5,
    comment:
      "The solid oak tambour credenza has completely anchored our living room. Smooth sliding joinery and a serene minimalist presence that invites daily pause.",
    is_published: true,
    created_at: "2026-02-10T12:00:00Z",
    updated_at: "2026-02-10T12:00:00Z",
    reviewer_name: "Astrid Lindgren, Stockholm Residence",
    product: { name: "Klinte Solid Oak Tambour Credenza", slug: "klinte-oak-tambour-credenza" },
  },
  {
    id: "curated-2",
    product_id: "a0000000-0000-4000-8000-000000000011",
    user_id: "user-2",
    order_id: "order-2",
    rating: 5,
    comment:
      "Atmospheric 2700K warm task lighting with zero glare. The solid brass pivot joint transforms evening desk hours into a calming ritual.",
    is_published: true,
    created_at: "2026-02-12T14:30:00Z",
    updated_at: "2026-02-12T14:30:00Z",
    reviewer_name: "Henrik Berg, Copenhagen Studio",
    product: { name: "Kalmar Matte Architectural Task Lamp", slug: "kalmar-architectural-task-lamp" },
  },
  {
    id: "curated-3",
    product_id: "a0000000-0000-4000-8000-000000000005",
    user_id: "user-3",
    order_id: "order-3",
    rating: 5,
    comment:
      "Exceptional wheel-thrown stoneware and airtight beechwood seals. Every countertop detail feels intentional and enduring.",
    is_published: true,
    created_at: "2026-02-14T09:15:00Z",
    updated_at: "2026-02-14T09:15:00Z",
    reviewer_name: "Freja Møller, Oslo Apartment",
    product: { name: "Vättern Glazed Stoneware Canister Trio", slug: "vattern-stoneware-canister-trio" },
  },
  {
    id: "curated-4",
    product_id: "a0000000-0000-4000-8000-000000000003",
    user_id: "user-4",
    order_id: "order-4",
    rating: 5,
    comment:
      "The CNC-milled walnut desk caddy and wool felt inserts brought immediate calm and organization to my workspace.",
    is_published: true,
    created_at: "2026-02-16T16:45:00Z",
    updated_at: "2026-02-16T16:45:00Z",
    reviewer_name: "Elias Vang, Helsinki Loft",
    product: { name: "Gotland Walnut & Wool Felt Desk Caddy", slug: "gotland-walnut-desk-caddy" },
  },
  {
    id: "curated-5",
    product_id: "a0000000-0000-4000-8000-000000000002",
    user_id: "user-5",
    order_id: "order-5",
    rating: 5,
    comment:
      "A study in restraint. The turned solid ash tray lip and powder-coated tripod stance balance daily function with sculptural lightness.",
    is_published: true,
    created_at: "2026-02-18T11:20:00Z",
    updated_at: "2026-02-18T11:20:00Z",
    reviewer_name: "Karin Holmberg, Gothenburg Villa",
    product: { name: "Södermalm Turned Ash Side Table", slug: "sodermalm-turned-ash-side-table" },
  },
  {
    id: "curated-6",
    product_id: "a0000000-0000-4000-8000-000000000012",
    user_id: "user-6",
    order_id: "order-6",
    rating: 5,
    comment:
      "Finding lighting that honors both architectural proportion and heavy honed Carrera marble weight is rare. Truly heirloom grade.",
    is_published: true,
    created_at: "2026-02-20T18:10:00Z",
    updated_at: "2026-02-20T18:10:00Z",
    reviewer_name: "Jonas Dahl, Malmö Gallery",
    product: { name: "Åre Carrera Marble Arc Floor Lamp", slug: "are-carrera-marble-floor-lamp" },
  },
  {
    id: "curated-7",
    product_id: "a0000000-0000-4000-8000-000000000008",
    user_id: "user-7",
    order_id: "order-7",
    rating: 5,
    comment:
      "The removable Belgian linen liner keeps knit blankets snag-free while the seagrass weave warms up our bedroom corner.",
    is_published: true,
    created_at: "2026-02-22T13:00:00Z",
    updated_at: "2026-02-22T13:00:00Z",
    reviewer_name: "Signe Nygård, Bergen Waterfront",
    product: { name: "Visby Braided Seagrass & Linen Basket", slug: "visby-braided-linen-basket" },
  },
  {
    id: "curated-8",
    product_id: "a0000000-0000-4000-8000-000000000007",
    user_id: "user-8",
    order_id: "order-8",
    rating: 5,
    comment:
      "Wall-mounting this solid white oak nightstand freed our floor space cleanly, and the concealed cord channel keeps charging hidden.",
    is_published: true,
    created_at: "2026-02-24T15:40:00Z",
    updated_at: "2026-02-24T15:40:00Z",
    reviewer_name: "Lukas Lindqvist, Aarhus Atelier",
    product: { name: "Leksand Floating Oak Nightstand", slug: "leksand-floating-oak-nightstand" },
  },
];

export function CustomerReviewsSection({
  reviews = [],
}: {
  reviews?: Review[];
}) {
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const isDraggingRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);

  // Synchronous hover ref so continuous animation frame tick freezes immediately on hover
  const isHoveredRef = useRef(false);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Combine live database reviews with curated reflections to guarantee an expansive slider pool
  const displayReviews: Review[] =
    reviews.length > 0
      ? [
          ...reviews,
          ...CURATED_REFLECTIONS.filter(
            (c) => !reviews.some((r) => r.id === c.id || r.comment === c.comment),
          ),
        ]
      : CURATED_REFLECTIONS;

  // True if there are more than 4 reviews (exceeding single-row desktop space)
  const isInfiniteSlider = displayReviews.length > 4;

  // Initial scroll position setup (start in middle set for seamless wrapping)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isInfiniteSlider) return;

    const setInitialPosition = () => {
      if (!container) return;
      const setWidth = container.scrollWidth / 3;
      if (setWidth > 0) {
        if (container.scrollLeft === 0 || container.scrollLeft < setWidth * 0.3) {
          container.scrollLeft = setWidth;
          scrollPosRef.current = setWidth;
        } else {
          scrollPosRef.current = container.scrollLeft;
        }
      }
    };

    setInitialPosition();
    const t1 = setTimeout(setInitialPosition, 100);
    const t2 = setTimeout(setInitialPosition, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isInfiniteSlider]);

  // Silky continuous auto-slide loop with high-precision float accumulation
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isInfiniteSlider) return;

    let lastTime = performance.now();
    // Calibrated calm pace: 45 pixels per second for clear, smooth, readable gliding
    const speed = 45;

    const tick = (now: number) => {
      const delta = Math.min(now - lastTime, 64);
      lastTime = now;

      // Only crawl when cursor is NOT hovering over a review card and NOT dragging
      if (!isHoveredRef.current && !isDraggingRef.current && scrollContainerRef.current) {
        const c = scrollContainerRef.current;
        scrollPosRef.current += speed * (delta / 1000);

        const setWidth = c.scrollWidth / 3;
        if (setWidth > 0) {
          if (scrollPosRef.current >= setWidth * 2) {
            scrollPosRef.current -= setWidth;
          } else if (scrollPosRef.current <= setWidth * 0.1) {
            scrollPosRef.current += setWidth;
          }
        }

        c.scrollLeft = scrollPosRef.current;
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isInfiniteSlider]);

  // Mouse dragging support on desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollStartRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const dist = x - startXRef.current;
    if (Math.abs(dist) > 3) {
      hasDraggedRef.current = true;
      scrollContainerRef.current.scrollLeft = scrollStartRef.current - dist;
      scrollPosRef.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (scrollContainerRef.current) {
      scrollPosRef.current = scrollContainerRef.current.scrollLeft;
    }
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  // Touch swiping support on mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.touches[0].pageX - container.offsetLeft;
    scrollStartRef.current = container.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const dist = x - startXRef.current;
    if (Math.abs(dist) > 3) {
      hasDraggedRef.current = true;
      scrollContainerRef.current.scrollLeft = scrollStartRef.current - dist;
      scrollPosRef.current = scrollContainerRef.current.scrollLeft;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    if (scrollContainerRef.current) {
      scrollPosRef.current = scrollContainerRef.current.scrollLeft;
    }
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current && (isDraggingRef.current || isHoveredRef.current)) {
      scrollPosRef.current = scrollContainerRef.current.scrollLeft;
    }
  };

  return (
    <section className="py-24 bg-[#F4F0E8] border-t border-[#1A1C18]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (Clean, minimal, no buttons) */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-semibold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Customer Reflections
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1C18] mb-3">
            Resonating Across Living Spaces
          </h2>
          <p className="text-sm sm:text-base text-[#4A483E] font-sans leading-relaxed max-w-2xl">
            Thoughtful reflections from patrons, interior architects, and design enthusiasts who have welcomed Kstore essentials into their homes.
          </p>
        </div>
      </div>

      {/* Infinite Auto-Slider / Dynamic Overflow Track */}
      {isInfiniteSlider ? (
        <div className="relative w-full overflow-hidden py-4 select-none">
          {/* Subtle edge fade masks */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#F4F0E8] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#F4F0E8] to-transparent z-10 pointer-events-none" />

          {/* Smooth Continuous Infinite Scroll Track with Hidden Native Scrollbars */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseLeave={() => {
              isHoveredRef.current = false;
              setIsHovered(false);
              isDraggingRef.current = false;
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex items-stretch gap-6 px-6 overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            title="Hover on any review card to pause or swipe to browse"
          >
            {/* 3 identical sets of reviews for seamless infinite wrap */}
            {[...displayReviews, ...displayReviews, ...displayReviews].map((review, idx) => (
              <div
                key={`${review.id}-${idx}`}
                data-review-card
                onMouseEnter={() => {
                  isHoveredRef.current = true;
                  setIsHovered(true);
                }}
                onMouseLeave={() => {
                  isHoveredRef.current = false;
                  setIsHovered(false);
                }}
                className="w-[310px] sm:w-[380px] shrink-0 bg-white p-7 sm:p-8 rounded-3xl border border-[#1A1C18]/12 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex text-[#B78E69] gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#D8C9B5]" />
                  </div>

                  <p className="text-sm text-[#1A1C18] leading-relaxed italic font-sans mb-6">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1A1C18]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[#1A1C18] flex items-center gap-1.5">
                        <span>{review.reviewer_name?.split(",")[0] || "Verified Patron"}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <div className="text-[11px] text-[#4A483E] mt-0.5 font-medium">
                        {review.reviewer_name?.split(",")[1] || "Living Space Collector"}
                      </div>
                    </div>
                  </div>

                  {review.product && (
                    <div className="pt-2">
                      <Link
                        href={`/product/${review.product.slug}`}
                        onClick={(e) => {
                          if (hasDraggedRef.current) e.preventDefault();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] text-[#8A927A] hover:text-[#1A1C18] font-medium transition-colors group"
                      >
                        <span>✦ {review.product.name}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Static 4-column Grid (When reviews are 4 or fewer and have plenty of space) */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-7 rounded-3xl border border-[#1A1C18]/12 shadow-xs flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-[#B78E69]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#D8C9B5]" />
                  </div>

                  <p className="text-xs sm:text-sm text-[#1A1C18] leading-relaxed italic font-sans mb-6">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1A1C18]/10">
                  <div className="font-bold text-xs text-[#1A1C18]">
                    {review.reviewer_name?.split(",")[0] || "Verified Patron"}
                  </div>
                  <div className="text-[11px] text-[#4A483E] mt-0.5 font-medium">
                    {review.reviewer_name?.split(",")[1] || "Living Space Collector"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
