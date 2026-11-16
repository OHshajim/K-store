"use client";

import type { ReactNode } from "react";
import { StoreTopNav } from "@/components/store/StoreTopNav";
import { PromoBar } from "@/components/store/PromoBar";
import { Footer } from "@/components/store/Footer";
import type { Category, Profile } from "@/lib/types";

export function StoreShell({
  storeName,
  tagline,
  supportEmail,
  logoUrl,
  categories = [],
  promoMessage,
  profile = null,
  children,
}: {
  storeName: string;
  tagline: string;
  supportEmail: string | null;
  logoUrl?: string | null;
  categories?: Category[];
  promoMessage?: string;
  profile?: Profile | null;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F0E8] text-[#1A1C18] antialiased selection:bg-[#D8C9B5] selection:text-[#1A1C18] overflow-x-clip">
      <PromoBar message={promoMessage || "Complimentary shipping on orders over $150."} />
      <StoreTopNav
        storeName={storeName}
        logoUrl={logoUrl}
        categories={categories}
        profile={profile}
      />
      <main className="flex-1 w-full overflow-x-clip">
        {children}
      </main>
      <Footer
        storeName={storeName}
        tagline={tagline}
        supportEmail={supportEmail}
        logoUrl={logoUrl}
      />
    </div>
  );
}
