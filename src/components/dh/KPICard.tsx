import type { LucideIcon } from "lucide-react";
import { CountUp } from "./CountUp";
import { cn } from "@/lib/utils";

type Color = "amber" | "red" | "green" | "yellow";

export function KPICard({
  title,
  value,
  suffix,
  Icon,
  color = "amber",
  decimals = 0,
  subtitle,
}: {
  title: string;
  value: number;
  suffix?: string;
  Icon: LucideIcon;
  color?: Color;
  decimals?: number;
  subtitle?: string;
}) {
  const glow = {
    amber: "glow-amber text-[#F59E0B]",
    red: "glow-red text-[#EF4444]",
    green: "glow-green text-[#10B981]",
    yellow: "glow-yellow text-[#FBBF24]",
  }[color];

  const iconColor = {
    amber: "text-[#F59E0B]",
    red: "text-[#EF4444]",
    green: "text-[#10B981]",
    yellow: "text-[#FBBF24]",
  }[color];

  return (
    <div className="fade-in relative overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827] p-5 transition hover:-translate-y-0.5 hover:border-[#F59E0B]/40">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#9CA3AF]">
          {title}
        </div>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <div className={cn("mt-4 font-mono text-5xl font-bold tabular-nums", glow)}>
        <CountUp end={value} decimals={decimals} suffix={suffix} />
      </div>
      {subtitle && <div className="mt-2 text-xs text-[#4B5563]">{subtitle}</div>}
      <div className={cn("absolute inset-x-0 top-0 h-[2px]", {
        "bg-[#F59E0B]": color === "amber",
        "bg-[#EF4444]": color === "red",
        "bg-[#10B981]": color === "green",
        "bg-[#FBBF24]": color === "yellow",
      })} />
    </div>
  );
}
