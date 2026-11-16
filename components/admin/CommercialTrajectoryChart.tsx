"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";

export type DailyPoint = {
  day: string;
  dateStr: string;
  revenueCents: number;
  ordersCount: number;
};

export function CommercialTrajectoryChart({
  points,
  currencySymbol = "$",
  currencyCode = "USD",
}: {
  points: DailyPoint[];
  currencySymbol?: string;
  currencyCode?: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalCents = points.reduce((sum, p) => sum + p.revenueCents, 0);
  const peakPoint = points.reduce(
    (max, p) => (p.revenueCents > max.revenueCents ? p : max),
    points[0] || { day: "Sun", dateStr: "", revenueCents: 0, ordersCount: 0 },
  );

  // SVG dimensions
  const svgWidth = 700;
  const svgHeight = 220;
  const chartTop = 30;
  const chartBottom = 180;
  const chartHeight = chartBottom - chartTop;
  const startX = 60;
  const endX = 640;
  const stepX = (endX - startX) / Math.max(1, points.length - 1);

  // Max value for scaling (round up to nearest reasonable ceiling)
  const maxRevenueCents = Math.max(
    peakPoint.revenueCents,
    100000, // at least $1,000 ceiling
  );
  const roundedMaxCents = Math.ceil(maxRevenueCents / 200000) * 200000 || 800000;

  // Grid steps (5 steps: 100%, 75%, 50%, 25%, 0%)
  const gridLines = [
    { y: chartTop, label: formatMoney(roundedMaxCents, currencySymbol, currencyCode) },
    { y: chartTop + chartHeight * 0.25, label: formatMoney(roundedMaxCents * 0.75, currencySymbol, currencyCode) },
    { y: chartTop + chartHeight * 0.5, label: formatMoney(roundedMaxCents * 0.5, currencySymbol, currencyCode) },
    { y: chartTop + chartHeight * 0.75, label: formatMoney(roundedMaxCents * 0.25, currencySymbol, currencyCode) },
    { y: chartBottom, label: formatMoney(0, currencySymbol, currencyCode) },
  ];

  // Calculate coordinates for points
  const coords = points.map((p, i) => {
    const x = startX + i * stepX;
    const ratio = p.revenueCents / roundedMaxCents;
    const y = chartBottom - ratio * chartHeight;
    return { ...p, x, y };
  });

  // Construct smooth SVG bezier path
  let pathD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const midX = (p0.x + p1.x) / 2;
      pathD += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  // Construct area path closing at chartBottom
  const areaD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x} ${chartBottom} L ${coords[0].x} ${chartBottom} Z`
    : "";

  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : null;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#1A1C18]/10 shadow-[0_2px_12px_rgba(26,28,24,0.04)] space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1C18]/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-editorial text-xl font-bold text-[#1A1C18]">
              Commercial Trajectory &amp; Revenue Velocity
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              7-Day Run Rate
            </span>
          </div>
          <p className="text-xs text-[#4A483E]/80 mt-1">
            Real-time daily conversion velocity and fulfilled transaction trajectory.
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#4A483E]/70 block">
              7-Day Total
            </span>
            <span className="text-base font-bold text-[#1A1C18]">
              {formatMoney(totalCents, currencySymbol, currencyCode)}
            </span>
          </div>
          <div className="w-px h-8 bg-[#1A1C18]/10" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#4A483E]/70 block">
              Peak ({peakPoint.day})
            </span>
            <span className="text-base font-bold text-[#B78E69]">
              {formatMoney(peakPoint.revenueCents, currencySymbol, currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B78E69" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#8A927A" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FAF9F6" stopOpacity="0.0" />
            </linearGradient>

            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#B78E69" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {gridLines.map((grid, idx) => (
            <g key={idx}>
              <line
                x1={startX - 10}
                y1={grid.y}
                x2={endX + 20}
                y2={grid.y}
                stroke="#1A1C18"
                strokeOpacity="0.07"
                strokeDasharray="4 4"
              />
              <text
                x={startX - 18}
                y={grid.y + 3.5}
                textAnchor="end"
                fill="#8A927A"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="500"
              >
                {grid.label}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {areaD && (
            <path
              d={areaD}
              fill="url(#areaGradient)"
              className="transition-all duration-300 pointer-events-none"
            />
          )}

          {/* Master Smooth Curve */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#B78E69"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none"
            />
          )}

          {/* Active Crosshair Guide Line */}
          {activePoint && (
            <g className="pointer-events-none transition-all duration-150">
              <line
                x1={activePoint.x}
                y1={chartTop}
                x2={activePoint.x}
                y2={chartBottom}
                stroke="#B78E69"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                strokeOpacity="0.6"
              />
              <rect
                x={activePoint.x - 16}
                y={activePoint.y}
                width="32"
                height={chartBottom - activePoint.y}
                rx="6"
                fill="#B78E69"
                fillOpacity="0.12"
              />
            </g>
          )}

          {/* Data Points, Vertical Bars, & Day Labels */}
          {coords.map((pt, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <g key={pt.day + index}>
                {/* Vertical Accent Pillar */}
                <rect
                  x={pt.x - 3}
                  y={pt.y}
                  width="6"
                  height={Math.max(0, chartBottom - pt.y)}
                  rx="3"
                  fill="#B78E69"
                  fillOpacity={isHovered ? "0.65" : "0.22"}
                  className="transition-all duration-200 pointer-events-none"
                />

                {/* Outer Glow Ring on Hover (Zero layout shift) */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="12"
                    fill="#B78E69"
                    fillOpacity="0.25"
                    className="pointer-events-none"
                  />
                )}

                {/* Anchor Circle (Uses radius animation, NOT CSS scale which breaks SVG coordinates) */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 5}
                  fill="#FFFFFF"
                  stroke="#B78E69"
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  filter={isHovered ? "url(#nodeGlow)" : undefined}
                  className="transition-all duration-150 pointer-events-none"
                />

                {/* Static Value Tag Above Node (hidden if hovered to allow tooltip) */}
                {!isHovered && (
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fill="#1A1C18"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    {formatMoney(pt.revenueCents, currencySymbol, currencyCode)}
                  </text>
                )}

                {/* X Axis Day Label */}
                <text
                  x={pt.x}
                  y={chartBottom + 20}
                  textAnchor="middle"
                  fill={isHovered ? "#1A1C18" : "#77766E"}
                  fontSize="11"
                  fontWeight={isHovered ? "bold" : "600"}
                  fontFamily="sans-serif"
                  className="transition-colors pointer-events-none"
                >
                  {pt.day}
                </text>

                {/* Transparent Interactive Hover Column (Broad hit area for effortless hover) */}
                <rect
                  x={pt.x - stepX / 2}
                  y={chartTop}
                  width={stepX}
                  height={chartBottom - chartTop + 30}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Pill (Positioned relative to chart without coordinate shifts) */}
        {activePoint && (
          <div
            className="absolute pointer-events-none z-20 transition-all duration-150 -translate-x-1/2"
            style={{
              left: `${(activePoint.x / svgWidth) * 100}%`,
              top: `${Math.max(10, (activePoint.y / svgHeight) * 100 - 35)}%`,
            }}
          >
            <div className="px-3.5 py-2 rounded-2xl bg-[#1A1C18] text-white shadow-xl border border-white/10 text-center whitespace-nowrap">
              <div className="text-[10px] text-[#D8C9B5] font-mono uppercase tracking-wider">
                {activePoint.day} {activePoint.dateStr ? `· ${activePoint.dateStr}` : ""}
              </div>
              <div className="text-sm font-bold font-mono text-white mt-0.5">
                {formatMoney(activePoint.revenueCents, currencySymbol, currencyCode)}
              </div>
              <div className="text-[9px] text-emerald-400 font-medium">
                {activePoint.ordersCount} {activePoint.ordersCount === 1 ? "order" : "orders"} placed
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
