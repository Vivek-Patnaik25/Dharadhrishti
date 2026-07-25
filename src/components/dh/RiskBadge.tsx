import { cn } from "@/lib/utils";
export function RiskBadge({ level }: { level: "high" | "medium" | "low" }) {
  const map = {
    high: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40",
    medium: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40",
    low: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40",
  };
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
      map[level]
    )}>
      {level}
    </span>
  );
}
