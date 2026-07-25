import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { demographics as mockDemographics } from "@/mock/data";
import { PageHeader } from "@/components/dh/PageHeader";
import { ExportButton } from "@/components/dh/ExportButton";
import { InsightCard } from "@/components/dh/InsightCard";
import { useInsight } from "@/hooks/use-insight";
import { apiGet } from "@/lib/api";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/demographics")({
  head: () => ({
    meta: [
      { title: "Demographics — DHARADRISHTI" },
      { name: "description", content: "Socio-demographic intelligence for victims and accused." },
    ],
  }),
  component: DemographicsPage,
});

const AMBER = ["#F59E0B", "#FBBF24", "#B45309", "#92400E"];
const RED = ["#EF4444", "#B91C1C", "#7F1D1D"];

function ChartTip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#F59E0B]/50 bg-[#1A2236] px-3 py-2 text-xs shadow-xl">
      {label && <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#F59E0B]">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i}>
          <span className="text-[#9CA3AF]">{p.name}:</span>{" "}
          <span className="font-mono font-bold">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 transition hover:border-[#F59E0B]/40">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-[#F9FAFB]">{title}</h3>
        <ExportButton targetId={id} filename={id} />
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}

function DemographicsPage() {
  const [demographics, setDemographics] = useState(mockDemographics);

  useEffect(() => {
    apiGet("/api/demographics", mockDemographics).then(setDemographics);
  }, []);

  const { insight, isLoading, generate } = useInsight("demographics");

  return (
    <div>
      <PageHeader
        title="Socio-Demographic Intelligence"
        subtitle="Victim + accused + complainant profiles"
        onInsight={() => generate({ totalVictims: 1251, totalAccused: 1437 })}
        isLoading={isLoading}
      />
      <InsightCard
        insight={insight?.text || "Demographic cross-analysis reveals concentration of victimization in the 31–45 age bracket and elevated female victim rates in cyber and domestic categories. Community-targeted intervention programs recommended for high-risk demographic corridors."}
        isLoading={isLoading}
      />

      <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#F59E0B]/40 bg-[#F59E0B]/10 p-4">
        <Sparkles className="h-5 w-5 shrink-0 text-[#F59E0B]" />
        <div className="text-sm">
          <span className="font-bold text-[#F59E0B]">Key insight:</span>{" "}
          19–30 age group accounts for 46% of all accused persons. Female victims constitute 32% of total victims, concentrated in Crimes Against Women and Cyber Crimes categories.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card id="victim-gender" title="Victim Gender">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={demographics.victimsByGender} dataKey="count" nameKey="gender" innerRadius={50} outerRadius={90} paddingAngle={2} stroke="#0A0E1A">
                {demographics.victimsByGender.map((_, i) => <Cell key={i} fill={[AMBER[0], RED[0], "#6B7280"][i]} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card id="victim-age" title="Victim Age Groups">
          <ResponsiveContainer>
            <BarChart data={demographics.victimsByAgeGroup} layout="vertical" margin={{ left: 20 }}>
              <defs>
                <linearGradient id="amberBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#4B5563" fontSize={10} tick={{ fill: "#9CA3AF" }} />
              <YAxis dataKey="ageGroup" type="category" stroke="#4B5563" fontSize={10} tick={{ fill: "#9CA3AF" }} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#F59E0B10" }} />
              <Bar dataKey="count" fill="url(#amberBar)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card id="occupation" title="Complainant Occupation">
          <ResponsiveContainer>
            <BarChart data={demographics.complainantsByOccupation} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#4B5563" fontSize={10} tick={{ fill: "#9CA3AF" }} />
              <YAxis dataKey="occupationName" type="category" stroke="#4B5563" fontSize={10} tick={{ fill: "#9CA3AF" }} width={90} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#F59E0B10" }} />
              <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card id="religion" title="Complainant Religion">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={demographics.complainantsByReligion} dataKey="count" nameKey="religionName" innerRadius={50} outerRadius={90} paddingAngle={2} stroke="#0A0E1A">
                {demographics.complainantsByReligion.map((_, i) => <Cell key={i} fill={AMBER[i % AMBER.length]} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card id="accused-age" title="Accused Age Groups">
          <ResponsiveContainer>
            <BarChart data={demographics.accusedByAgeGroup} layout="vertical" margin={{ left: 20 }}>
              <defs>
                <linearGradient id="redBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" stroke="#4B5563" fontSize={10} tick={{ fill: "#9CA3AF" }} />
              <YAxis dataKey="ageGroup" type="category" stroke="#4B5563" fontSize={10} tick={{ fill: "#9CA3AF" }} />
              <Tooltip content={<ChartTip />} cursor={{ fill: "#EF444410" }} />
              <Bar dataKey="count" fill="url(#redBar)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card id="heatmap" title="Crime × Gender Heatmap">
          <Heatmap />
        </Card>
      </div>
    </div>
  );
}

function Heatmap() {
  const crimes = ["Body", "Property", "Cyber", "Women", "Economic"];
  const genders = ["Male", "Female", "Trans"];
  const data: number[][] = [
    [433, 286, 12],
    [620, 154, 8],
    [310, 225, 6],
    [45, 864, 4],
    [211, 60, 3],
  ];
  const max = Math.max(...data.flat());
  return (
    <div className="flex h-full flex-col">
      <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
        <div />{genders.map((g) => <div key={g} className="text-center">{g}</div>)}
      </div>
      <div className="flex-1 space-y-1">
        {crimes.map((c, i) => (
          <div key={c} className="grid grid-cols-[80px_1fr_1fr_1fr] gap-1 h-9">
            <div className="flex items-center text-xs text-[#9CA3AF]">{c}</div>
            {genders.map((_, j) => {
              const v = data[i][j];
              const intensity = v / max;
              return (
                <div
                  key={j}
                  className="flex items-center justify-center rounded font-mono text-xs font-bold text-[#F9FAFB]"
                  style={{ background: `rgba(245,158,11,${0.15 + intensity * 0.75})` }}
                >
                  {v}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
