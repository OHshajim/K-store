import Link from "next/link";
import { Compass, ArrowRight, Home } from "lucide-react";
import { StoreTopNav } from "@/components/store/StoreTopNav";
import { PromoBar } from "@/components/store/PromoBar";
import { Footer } from "@/components/store/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F0E8] text-[#1A1C18]">
      <PromoBar message="Complimentary shipping on orders over $150." />
      <StoreTopNav storeName="Kstore" />

      <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Architectural Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8A927A]/15 text-[#8A927A] text-xs font-semibold uppercase tracking-wider mb-6">
            <Compass className="w-4 h-4" />
            Coordinates Uncharted
          </div>

          <h1 className="font-editorial text-5xl sm:text-7xl font-bold tracking-tight text-[#1A1C18] mb-4">
            404 — Room Not Found
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#4A483E] max-w-lg mx-auto mb-10 leading-relaxed font-light">
            The spatial arrangement or home essential you are looking for has been relocated, archived, or does not exist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/shop"
              data-btn="dark"
              style={{ color: "#FFFFFF", backgroundColor: "#1A1C18" }}
              className="w-full sm:w-auto px-8 py-4 bg-[#1A1C18] text-white text-sm font-semibold rounded-xl hover:bg-[#32362F] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span style={{ color: "#FFFFFF" }}>Explore Curated Catalog</span>
              <ArrowRight className="w-4 h-4 text-white" style={{ color: "#FFFFFF" }} />
            </Link>

            <Link
              href="/"
              data-btn="light"
              style={{ color: "#1A1C18", backgroundColor: "#FFFFFF" }}
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#1A1C18] border border-[#1A1C18]/15 text-sm font-semibold rounded-xl hover:bg-[#F4F0E8] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#1A1C18]" />
              <span style={{ color: "#1A1C18" }}>Return to Home</span>
            </Link>
          </div>

          {/* Quick Spatial Shortcuts */}
          <div className="pt-8 border-t border-[#1A1C18]/10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#4A483E] block mb-4">
              Explore by Room Environment
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {[
                { label: "Living Room", href: "/shop?room=living" },
                { label: "Workspace", href: "/shop?room=workspace" },
                { label: "Kitchen", href: "/shop?room=kitchen" },
                { label: "Bedroom", href: "/shop?room=bedroom" },
                { label: "Bathroom", href: "/shop?room=bathroom" },
                { label: "Lighting", href: "/shop?room=lighting" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-[#1A1C18]/12 text-[#1A1C18] hover:bg-[#1A1C18] hover:text-white transition-all shadow-2xs"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer storeName="Kstore" />
    </div>
  );
}

