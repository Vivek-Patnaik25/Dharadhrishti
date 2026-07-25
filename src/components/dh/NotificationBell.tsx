import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Alert } from "@/mock/data";

export function NotificationBell({ alerts }: { alerts: Alert[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const critical = alerts.filter((a) => a.severity === "critical").length;
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md border border-[#1F2937] p-2 text-[#9CA3AF] hover:border-[#F59E0B]/50 hover:text-[#F59E0B]"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {alerts.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white">
            {alerts.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827] shadow-2xl">
          <div className="border-b border-[#1F2937] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
            {alerts.length} Alerts • {critical} Critical
          </div>
          <div className="max-h-80 overflow-auto">
            {alerts.map((a) => (
              <div key={a.alertId} className="border-b border-[#1F2937] px-4 py-3 last:border-0">
                <div className={`text-xs font-semibold ${a.severity === "critical" ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>
                  {a.districtName} — {a.crimeSubHead}
                </div>
                <div className="mt-1 text-[11px] text-[#9CA3AF]">{a.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
