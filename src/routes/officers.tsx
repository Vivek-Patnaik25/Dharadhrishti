import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { officerAnalytics as mockOfficerAnalytics, courts as mockCourts } from "@/mock/data";
import { PageHeader } from "@/components/dh/PageHeader";
import { InsightCard } from "@/components/dh/InsightCard";
import { useInsight } from "@/hooks/use-insight";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/officers")({
  head: () => ({
    meta: [
      { title: "Officer Analytics — DHARADRISHTI" },
      { name: "description", content: "Station performance and false FIR detection." },
    ],
  }),
  component: OfficersPage,
});

type Sort = "chargesheetRate" | "falseRate" | "totalCases" | "avgInvestigationDays";

function ChartTip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#F59E0B]/50 bg-[#1A2236] px-3 py-2 text-xs shadow-xl">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#F59E0B]">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#9CA3AF]">{p.name}:</span>
          <span className="ml-auto font-mono font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function OfficersPage() {
  const [officerAnalytics, setOfficerAnalytics] = useState(mockOfficerAnalytics);
  const [courts, setCourts] = useState(mockCourts);

  useEffect(() => {
    apiGet("/api/officer-analytics", mockOfficerAnalytics).then(setOfficerAnalytics);
    apiGet<{ courts: { courtId: number; courtName: string; chargesheetCases: number; falseCases: number; undetectedCases: number }[] }>("/api/officer-analytics/court-pipeline", { courts: [] }).then(d => {
      if (d.courts && d.courts.length > 0) {
        setCourts(d.courts.map(c => ({ name: c.courtName, chargesheet: c.chargesheetCases, falseCases: c.falseCases, undetected: c.undetectedCases })));
      }
    });
  }, []);

  const [sort, setSort] = useState<Sort>("falseRate");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const sorted = [...officerAnalytics.stations].sort((a, b) => {
    const v = (b[sort] as number) - (a[sort] as number);
    return dir === "desc" ? v : -v;
  });
  const toggleSort = (s: Sort) => {
    if (sort === s) setDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSort(s); setDir("desc"); }
  };

  const { insight, isLoading, generate } = useInsight("officers");

  return (
    <div>
      <PageHeader
        title="Officer & Station Analytics"
        subtitle="Performance metrics • False FIR detection • Court pipeline"
        onInsight={() => generate({ avgChargesheetRate: officerAnalytics.stationwideAvgChargesheetRate, avgFalseRate: officerAnalytics.stationwideAvgFalseRate, flaggedCount: officerAnalytics.flaggedStations?.length || 2 })}
        isLoading={isLoading}
      />
      <InsightCard
        insight={insight?.text || "Station performance analysis flags police stations for anomalous false FIR rates exceeding 1.5x state average. Recommend immediate supervisory review and IO performance audit for Hebbal PS and Shivajinagar PS to restore institutional integrity."}
        isLoading={isLoading}
      />

      {/* False FIR Alert */}
      <div className="rounded-lg border-2 border-[#EF4444]/50 bg-[#EF4444]/5 p-5">
        <div className="flex items-center gap-2 text-[#EF4444]">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest">
            False FIR Alert — Flagged Stations
          </h2>
        </div>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Stations with abnormally high B-type (False Case) closure rates vs statewide average of {officerAnalytics.stationwideAvgFalseRate}%
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {officerAnalytics.flaggedStations.map((s) => (
            <div key={s.unitId} className="rounded-lg border border-[#EF4444]/40 bg-[#111827] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-base font-bold text-[#F9FAFB]">{s.unitName}</div>
                  <div className="text-xs text-[#9CA3AF]">{s.districtName}</div>
                </div>
                <button className="rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#EF4444] hover:bg-[#EF4444]/20">
                  Details
                </button>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="font-mono text-4xl font-bold text-[#EF4444] glow-red">
                    {s.falseRate.toFixed(1)}%
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">State avg {s.stateAvg}%</div>
                </div>
                <div className="rounded-full bg-[#EF4444]/15 px-2 py-1 font-mono text-xs font-bold text-[#EF4444]">
                  +{s.deviation.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Station table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
        <div className="border-b border-[#1F2937] p-4">
          <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-[#F59E0B]">Station Performance</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1F2937] text-[10px] uppercase tracking-widest text-[#9CA3AF]">
              <th className="px-4 py-3 text-left">Station</th>
              <th className="px-4 py-3 text-left">District</th>
              <SortH sort={sort} field="totalCases" dir={dir} onClick={toggleSort}>Cases</SortH>
              <SortH sort={sort} field="chargesheetRate" dir={dir} onClick={toggleSort}>Chargesheet</SortH>
              <SortH sort={sort} field="falseRate" dir={dir} onClick={toggleSort}>False Rate</SortH>
              <SortH sort={sort} field="avgInvestigationDays" dir={dir} onClick={toggleSort}>Avg Days</SortH>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const cRate = s.chargesheetRate;
              const cColor = cRate > 65 ? "text-[#10B981]" : cRate >= 40 ? "text-[#FBBF24]" : "text-[#EF4444]";
              return (
                <tr key={s.unitId} className="border-b border-[#1F2937] last:border-0 hover:bg-white/5">
                  <td className="px-4 py-3 font-mono text-[#F9FAFB]">{s.unitName}</td>
                  <td className="px-4 py-3 text-[#9CA3AF]">{s.districtName}</td>
                  <td className="px-4 py-3 font-mono">{s.totalCases}</td>
                  <td className={cn("px-4 py-3 font-mono font-bold", cColor)}>{s.chargesheetRate.toFixed(1)}%</td>
                  <td className={cn("px-4 py-3 font-mono font-bold", s.isFlagged ? "text-[#EF4444]" : "text-[#9CA3AF]")}>
                    {s.falseRate.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 font-mono">{s.avgInvestigationDays}</td>
                  <td className="px-4 py-3">
                    {s.isFlagged ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EF4444]/15 px-2 py-0.5 text-[10px] font-bold text-[#EF4444]">
                        <AlertTriangle className="h-3 w-3" /> FLAGGED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                        <CheckCircle2 className="h-3 w-3" /> NORMAL
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Court pipeline */}
      <div className="mt-6 rounded-lg border border-[#1F2937] bg-[#111827] p-5">
        <h3 className="mb-4 font-mono text-sm font-bold uppercase tracking-widest text-[#F59E0B]">Court Pipeline</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courts} margin={{ top: 10, right: 10, left: -10 }}>
              <CartesianGrid stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#4B5563" fontSize={11} tick={{ fill: "#9CA3AF" }} />
              <YAxis stroke="#4B5563" fontSize={10} tick={{ fill: "#9CA3AF" }} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#F59E0B10" }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} iconType="circle" />
              <Bar dataKey="chargesheet" name="Chargesheeted" stackId="a" fill="#10B981" />
              <Bar dataKey="falseCases" name="False Cases" stackId="a" fill="#EF4444" />
              <Bar dataKey="undetected" name="Undetected" stackId="a" fill="#4B5563" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SortH({ sort, field, dir, onClick, children }: { sort: Sort; field: Sort; dir: "asc" | "desc"; onClick: (s: Sort) => void; children: React.ReactNode }) {
  const active = sort === field;
  return (
    <th className="px-4 py-3 text-left">
      <button onClick={() => onClick(field)} className={cn("inline-flex items-center gap-1", active ? "text-[#F59E0B]" : "hover:text-[#F9FAFB]")}>
        {children}
        {active && <span>{dir === "desc" ? "↓" : "↑"}</span>}
      </button>
    </th>
  );
}
