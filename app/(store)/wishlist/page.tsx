import type { Metadata } from "next";
import { WishlistView } from "@/components/store/WishlistView";

export const metadata: Metadata = {
  title: "Your Wishlist — Kstore",
  description: "View and manage your saved Scandinavian living essentials.",
};

export default function WishlistPage() {
  return <WishlistView />;
}

