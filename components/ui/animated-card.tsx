"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Card Shell ──────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AnimatedCard({ className, ...props }: CardProps) {
  return (
    <div
      role="region"
      className={cn(
        "group/animated-card relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30",
        className
      )}
      {...props}
    />
  );
}

export function AnimatedCardBody({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 border-t border-border p-4",
        className
      )}
      {...props}
    />
  );
}

export function AnimatedCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-heading font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function AnimatedCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function AnimatedCardVisual({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("h-[180px] w-full overflow-hidden", className)}
      {...props}
    />
  );
}

// ── Visual: Animated Bar Chart ──────────────────────────────
interface VisualChartProps {
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
}

export function VisualChart({
  mainColor = "#FF6B2C",
  secondaryColor = "#E85D1A",
  gridColor = "#FF6B2C10",
}: VisualChartProps) {
  const [hovered, setHovered] = useState(false);

  // Paired bars (main + secondary side by side)
  const barPairs = [
    { x: 24, h1: 30, h2: 20, hh1: 50, hh2: 35 },
    { x: 62, h1: 45, h2: 35, hh1: 40, hh2: 55 },
    { x: 100, h1: 55, h2: 40, hh1: 65, hh2: 50 },
    { x: 138, h1: 35, h2: 50, hh1: 55, hh2: 40 },
    { x: 176, h1: 60, h2: 45, hh1: 45, hh2: 70 },
    { x: 214, h1: 50, h2: 65, hh1: 70, hh2: 55 },
    { x: 252, h1: 70, h2: 55, hh1: 60, hh2: 80 },
    { x: 290, h1: 80, h2: 60, hh1: 90, hh2: 70 },
  ];

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-t-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Grid */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 60%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 60%, #000 30%, transparent 100%)",
        }}
      />

      {/* Bottom glow */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${mainColor}30 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0.6,
        }}
      />

      {/* Decorative curve on left */}
      <svg
        className="absolute left-0 bottom-0 z-[2] opacity-40 transition-opacity duration-500"
        style={{ opacity: hovered ? 0.6 : 0.3 }}
        width="80"
        height="180"
        viewBox="0 0 80 180"
        fill="none"
      >
        <path
          d="M-20 180 C-20 120, 40 100, 30 40 C25 10, 10 0, -20 -10"
          stroke={mainColor}
          strokeWidth="1.5"
          fill={`${mainColor}08`}
        />
      </svg>

      {/* Bars */}
      <svg
        className="absolute inset-0 z-[3] transition-transform duration-700 ease-out"
        style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
        width="100%"
        height="100%"
        viewBox="0 0 356 180"
        preserveAspectRatio="xMidYMax meet"
      >
        {barPairs.map((pair, i) => {
          const h1 = hovered ? pair.hh1 : pair.h1;
          const h2 = hovered ? pair.hh2 : pair.h2;
          return (
            <React.Fragment key={i}>
              <rect
                x={pair.x}
                y={160 - h1}
                width={13}
                height={h1}
                rx={2.5}
                fill={mainColor}
                className="transition-all duration-500 ease-out"
                style={{ transitionDelay: `${i * 30}ms` }}
              />
              <rect
                x={pair.x + 15}
                y={160 - h2}
                width={13}
                height={h2}
                rx={2.5}
                fill={secondaryColor}
                opacity={0.5}
                className="transition-all duration-500 ease-out"
                style={{ transitionDelay: `${i * 30 + 15}ms` }}
              />
            </React.Fragment>
          );
        })}
      </svg>

      {/* Legend badge */}
      <div
        className={cn(
          "absolute top-3 right-3 z-[5] flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-sm transition-all duration-300",
          hovered ? "opacity-0 -translate-y-2" : "opacity-100"
        )}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: mainColor }} />
          <span className="text-[10px] font-medium text-white/80">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
          <span className="text-[10px] font-medium text-white/80">Expense</span>
        </div>
      </div>

      {/* Hover tooltip */}
      <div
        className={cn(
          "absolute top-3 right-3 z-[5] rounded-lg border border-white/10 bg-black/50 p-3 backdrop-blur-sm transition-all duration-400",
          hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: mainColor }} />
          <p className="text-xs font-medium text-white">Monthly Overview</p>
        </div>
        <p className="text-[10px] text-white/50 mt-0.5">Tracking income & expenses</p>
      </div>
    </div>
  );
}

// ── Visual: Animated Rings ──────────────────────────────────
interface VisualRingsProps {
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
}

export function VisualRings({
  mainColor = "#FF6B2C",
  secondaryColor = "#FF8F5C",
  gridColor = "#FF6B2C10",
}: VisualRingsProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-t-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Grid */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 100%)",
        }}
      />

      {/* Center glow */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${mainColor}18 0%, transparent 50%)`,
          opacity: hovered ? 1 : 0.5,
        }}
      />

      {/* Rings */}
      <svg className="absolute inset-0 z-[3] m-auto" width="160" height="160" viewBox="0 0 160 160">
        <circle
          cx="80" cy="80" r="70"
          fill="none"
          stroke={mainColor}
          strokeWidth="6"
          strokeDasharray="330 110"
          strokeLinecap="round"
          opacity="0.85"
          className="transition-all duration-700 ease-out"
          style={{ transform: hovered ? "rotate(90deg)" : "rotate(0deg)", transformOrigin: "80px 80px" }}
        />
        <circle
          cx="80" cy="80" r="52"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="5"
          strokeDasharray="220 110"
          strokeLinecap="round"
          opacity="0.55"
          className="transition-all duration-700 ease-out"
          style={{ transform: hovered ? "rotate(-120deg)" : "rotate(0deg)", transformOrigin: "80px 80px" }}
        />
        <circle
          cx="80" cy="80" r="34"
          fill="none"
          stroke={mainColor}
          strokeWidth="4"
          strokeDasharray="140 75"
          strokeLinecap="round"
          opacity="0.4"
          className="transition-all duration-700 ease-out"
          style={{ transform: hovered ? "rotate(180deg)" : "rotate(0deg)", transformOrigin: "80px 80px" }}
        />
        <text
          x="80" y="76" textAnchor="middle"
          fill="white" fontWeight="700" fontSize="22"
          className="transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0.8 }}
        >
          72%
        </text>
        <text x="80" y="94" textAnchor="middle" fill="#999" fontSize="10">
          budget used
        </text>
      </svg>

      {/* Badge on hover */}
      <div
        className={cn(
          "absolute top-3 right-3 z-[5] flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-sm transition-all duration-300",
          hovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-medium text-white/80">On track</span>
      </div>
    </div>
  );
}
