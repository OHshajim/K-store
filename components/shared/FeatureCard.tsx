import type { ComponentType, SVGProps } from "react";

export function FeatureCard({
  icon: IconComponent,
  title,
  description,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-[#1A1C18]/10 shadow-2xs space-y-3">
      <div className="w-10 h-10 rounded-xl bg-[#F4F0E8] flex items-center justify-center text-[#B78E69]">
        <IconComponent className="w-5 h-5" />
      </div>
      <h3 className="text-base font-bold text-[#1A1C18] font-editorial">{title}</h3>
      <p className="text-xs text-[#4A483E]/70 leading-relaxed font-sans">{description}</p>
    </div>
  );
}
