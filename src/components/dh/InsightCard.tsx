import { Sparkles, Loader2 } from "lucide-react";

export function InsightCard({ insight, isLoading }: { insight: string; isLoading: boolean }) {
  if (!insight && !isLoading) return null;

  return (
    <div className="slide-down overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827] p-5 pl-6 relative shadow-xl mb-6">
      <div className="absolute inset-y-0 left-0 w-1 bg-[#F59E0B]" />
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F59E0B]">
        <Sparkles className="h-4 w-4" /> GLM Intelligence Insight
      </div>
      <div className="mt-3 text-sm leading-relaxed text-[#F9FAFB]/90 font-sans">
        {isLoading ? (
          <div className="flex items-center gap-2.5 font-mono text-xs text-[#9CA3AF]">
            <Loader2 className="h-4 w-4 animate-spin text-[#F59E0B]" />
            <span>Analyzing dataset context via Catalyst QuickML GLM Engine...</span>
          </div>
        ) : (
          insight
        )}
      </div>
    </div>
  );
}
