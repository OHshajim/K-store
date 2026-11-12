"use client";

import { Truck, ShieldCheck, Mail } from "lucide-react";

export function TrustStrip({ supportEmail }: { supportEmail: string | null }) {
  const features = [
    {
      icon: Truck,
      title: "Delivered by hand",
      description: "White-glove placement in our regional corridors — no damaged parcels.",
    },
    {
      icon: ShieldCheck,
      title: "Verified by craftsman",
      description: "Every timber essential and joinery assembly inspected before dispatch.",
    },
    {
      icon: Mail,
      title: "Talk to our studio",
      description: supportEmail
        ? `Questions regarding an essential? Email ${supportEmail} — our architects reply.`
        : "Questions regarding an essential? Email our studio — our architects reply.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {features.map((feature) => {
        const IconComponent = feature.icon;
        return (
          <div
            key={feature.title}
            className="p-5 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#B78E69] shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[#1A1C18] uppercase tracking-wider font-sans">
                {feature.title}
              </h4>
              <p className="text-xs text-[#4A483E]/70 leading-relaxed font-sans">
                {feature.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
