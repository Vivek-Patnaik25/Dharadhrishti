import { FileDown, Loader2 } from "lucide-react";

export function PdfProgressOverlay({
  open, progress, stage, error,
}: { open: boolean; progress: number; stage: string; error?: string | null }) {
  if (!open) return null;
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0A0E1A]/80 backdrop-blur-sm">
      <div className="w-[420px] max-w-[92vw] rounded-lg border border-[#F59E0B]/30 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F59E0B]/15 ring-1 ring-[#F59E0B]/40">
            {error ? <FileDown className="h-4 w-4 text-[#EF4444]" /> : <Loader2 className="h-4 w-4 animate-spin text-[#F59E0B]" />}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
              District Intelligence Report
            </div>
            <div className="font-mono text-sm font-bold text-[#F9FAFB]">
              {error ? "Export failed" : "Generating PDF…"}
            </div>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between text-[11px]">
          <span className="text-[#9CA3AF]">{error ?? stage}</span>
          <span className="font-mono font-bold text-[#F59E0B]">{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#1F2937]">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${error ? "bg-[#EF4444]" : "bg-gradient-to-r from-[#F59E0B] to-[#F97316]"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#4B5563]">
          <span>CONFIDENTIAL</span>
          <span>{error ? "Aborted" : pct === 100 ? "Downloaded" : "In progress"}</span>
        </div>
      </div>
    </div>
  );
}
