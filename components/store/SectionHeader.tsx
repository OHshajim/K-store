import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  kicker,
  title,
  hint,
  actionHref,
  actionLabel,
}: {
  kicker: string;
  title: string;
  hint: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#1A1C18]/10">
      <div className="space-y-1">
        <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-[#B78E69] block">
          {kicker}
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1C18]">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#4A483E]/80 font-sans">
          {hint}
        </p>
      </div>

      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1C18] hover:text-[#B78E69] transition-colors shrink-0 group"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
