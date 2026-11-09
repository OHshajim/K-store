"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const ROOM_PILLARS = [
  {
    room: "Living Room",
    slug: "living",
    headline: "Serene Gathering Spaces",
    desc: "Modular timber shelving, sculptural coffee tables, and low credenzas.",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    itemCount: "5 Essentials",
  },
  {
    room: "Workspace",
    slug: "workspace",
    headline: "Quiet Focus & Ergonomics",
    desc: "Organizers, monitor stands, and glare-free task lamps for deep flow.",
    image: "https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80",
    itemCount: "5 Essentials",
  },
  {
    room: "Kitchen",
    slug: "kitchen",
    headline: "Culinary Prep & Ritual",
    desc: "Airtight ceramic canisters, tiered spice racks, and walnut platters.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
    itemCount: "5 Essentials",
  },
  {
    room: "Bedroom",
    slug: "bedroom",
    headline: "Restorative Rest Sanctuaries",
    desc: "Floating nightstands, felt bedside organizers, and amber lamps.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    itemCount: "5 Essentials",
  },
];

export function ShopByRoomSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-[#8A927A] block mb-2 font-sans">
          Spatial Harmony
        </span>
        <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1C18] mb-4">
          Shop by Room
        </h2>
        <p className="text-sm sm:text-base text-[#4A483E] font-sans leading-relaxed">
          Every corner of your residence deserves dedicated contemplation. Explore our collections curated specifically by architectural room function.
        </p>
      </div>

      {/* 4 Immersive Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ROOM_PILLARS.map((room) => (
          <Link
            key={room.slug}
            href={`/shop?room=${room.slug}`}
            className="group relative h-[420px] sm:h-[480px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col justify-end p-8 border border-[#1A1C18]/12"
          >
            {/* Background Lifestyle Image */}
            <div className="absolute inset-0 z-0 bg-[#1A1C18]">
              <Image
                src={room.image}
                alt={room.headline}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
              />
              {/* Gradient layer */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C18]/90 via-[#1A1C18]/40 to-black/10 transition-opacity group-hover:opacity-90" />
            </div>

            {/* Room Card Overlay Content */}
            <div className="relative z-10 text-white space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#D8C9B5] uppercase tracking-wider mb-1">
                <span>{room.room}</span>
                <span>{room.itemCount}</span>
              </div>

              <h3 className="font-editorial text-2xl sm:text-4xl font-bold text-white group-hover:text-[#D8C9B5] transition-colors">
                {room.headline}
              </h3>

              <p className="text-xs sm:text-sm text-[#F4F0E8]/85 max-w-md font-sans">
                {room.desc}
              </p>

              <div className="pt-3 inline-flex items-center gap-2 text-xs font-semibold text-white group-hover:text-[#D8C9B5] group-hover:translate-x-1.5 transition-all">
                <span>Explore {room.room} Architecture</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
