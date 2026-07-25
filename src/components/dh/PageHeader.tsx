import { Sparkles, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function PageHeader({
  title,
  subtitle,
  onInsight,
  isLoading,
  right,
}: {
  title: string;
  subtitle?: string;
  onInsight?: () => void;
  isLoading?: boolean;
  right?: ReactNode;
}) {
  const { canInsight } = useAuth();
  return (
    <div className="mb-6 flex items-end justify-between gap-4 fade-in">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F59E0B]">
          Karnataka Police // Intelligence
        </div>
        <h1 className="mt-1 font-mono text-3xl font-bold tracking-tight text-[#F9FAFB]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-[#9CA3AF]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {right}
        {onInsight && canInsight && (
          <button
            onClick={onInsight}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-[#F59E0B] transition hover:bg-[#F59E0B]/20 disabled:opacity-75"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F59E0B] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F59E0B]" />
            </span>
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate Insight</span>
              </>
            )}
          </button>
        )}
        {onInsight && !canInsight && (
          <span
            title="Analyst role is read-only. Generate Insight is disabled — GLM inference calls are restricted to officers with L2+ clearance."
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-[#1F2937] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6B7280]"
          >
            Insight disabled · read-only
          </span>
        )}
      </div>
    </div>
  );
}
