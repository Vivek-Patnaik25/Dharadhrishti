import { Download } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function ExportButton({ targetId, filename = "export" }: { targetId: string; filename?: string }) {
  const { canExport } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!canExport) {
    return (
      <span
        title="Analyst role is read-only. PNG export is disabled to preserve chain-of-custody on evidentiary data."
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-md border border-[#1F2937] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#6B7280]"
      >
        <Download className="h-3 w-3" />
        Locked
      </span>
    );
  }

  const onClick = async () => {
    setBusy(true);
    try {
      const el = document.getElementById(targetId);
      if (!el) return;
      await document.fonts.ready;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0A0E1A",
        logging: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(targetId);
          if (clonedElement) {
            clonedElement.style.background = "#0A0E1A";
            clonedElement.style.color = "#F9FAFB";
          }
        }
      });

      const link = document.createElement("a");
      link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#1F2937] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF] transition hover:border-[#F59E0B]/50 hover:text-[#F59E0B] disabled:opacity-50"
    >
      <Download className="h-3 w-3" />
      {busy ? "..." : "PNG"}
    </button>
  );
}
