import type { Alert } from "@/mock/data";

export function AlertTicker({ alerts }: { alerts: Alert[] }) {
  const items = [...alerts, ...alerts];
  return (
    <div className="relative overflow-hidden border-y border-[#1F2937] bg-[#0A0E1A]/90">
      <div className="flex items-center">
        <div className="z-10 flex shrink-0 items-center gap-2 border-r border-[#1F2937] bg-[#111827] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F59E0B]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#EF4444] pulse-dot" />
          Live Alerts
        </div>
        <div className="ticker-track flex shrink-0 gap-8 whitespace-nowrap py-2 pl-8 font-mono text-xs">
          {items.map((a, i) => (
            <span
              key={i}
              className={a.severity === "critical" ? "text-[#EF4444]" : "text-[#F59E0B]"}
            >
              <span className="mr-2 opacity-60">•</span>
              {a.message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
