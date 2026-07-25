import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { riskScores as mockRiskScores, alerts as mockAlerts } from "@/mock/data";
import { PageHeader } from "@/components/dh/PageHeader";
import { InsightCard } from "@/components/dh/InsightCard";
import { useInsight } from "@/hooks/use-insight";
import { RiskBadge } from "@/components/dh/RiskBadge";
import { CountUp } from "@/components/dh/CountUp";
import { useScope } from "@/lib/scope";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predictive Risk — DHARADRISHTI" },
      { name: "description", content: "AI-powered crime risk forecasts by district." },
    ],
  }),
  component: PredictPage,
});

type Sort = "risk" | "district" | "trend";

function PredictPage() {
  const { scope, isScoped, district } = useScope();

  const [riskScoresRaw, setRiskScoresRaw] = useState(mockRiskScores);
  const [alertsRaw, setAlertsRaw] = useState(mockAlerts);

  useEffect(() => {
    apiGet<{ predictions: typeof mockRiskScores }>("/api/predict/risk-scores", { predictions: mockRiskScores }).then(d => {
      setRiskScoresRaw(d && d.predictions && d.predictions.length > 0 ? d.predictions : mockRiskScores);
    });
    apiGet<{ alerts: typeof mockAlerts }>("/api/alerts/anomalies", { alerts: mockAlerts }).then(d => {
      setAlertsRaw(d && d.alerts && d.alerts.length > 0 ? d.alerts : mockAlerts);
    });
  }, []);

  const riskScores = scope(riskScoresRaw);
  const alerts = scope(alertsRaw);
  const [sort, setSort] = useState<Sort>("risk");

  const sorted = useMemo(() => {
    const arr = [...riskScores];
    if (sort === "risk") arr.sort((a, b) => b.riskScore - a.riskScore);
    if (sort === "district") arr.sort((a, b) => a.districtName.localeCompare(b.districtName));
    if (sort === "trend") arr.sort((a, b) => b.trendPercent - a.trendPercent);
    return arr;
  }, [sort, riskScores]);

  const counts = {
    high: riskScores.filter((r) => r.riskLevel === "high").length,
    medium: riskScores.filter((r) => r.riskLevel === "medium").length,
    low: riskScores.filter((r) => r.riskLevel === "low").length,
  };

  const { insight, isLoading, generate } = useInsight("predict");

  return (
    <div>
      <PageHeader
        title="Predictive Risk Dashboard"
        subtitle={isScoped ? `${district} • 30-day forecast horizon • GLM ensemble` : "30-day forecast horizon • GLM ensemble model"}
        onInsight={() => generate({ districtName: district, highRiskCount: counts.high, activeAlerts: alerts.length })}
        isLoading={isLoading}
      />
      <InsightCard
        insight={insight?.text || "Predictive models flag districts at elevated crime probability for the next 30-day window. Recommend pre-positioning 2 additional patrol units in high-density zones before the weekend surge period."}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RiskSummary label="High Risk Districts" value={counts.high} color="red" />
        <RiskSummary label="Medium Risk Districts" value={counts.medium} color="amber" />
        <RiskSummary label="Low Risk Districts" value={counts.low} color="green" />
      </div>

      <div className="mt-6 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Sort:</span>
        {(["risk", "district", "trend"] as Sort[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize",
              sort === s ? "border-[#F59E0B] bg-[#F59E0B]/15 text-[#F59E0B]" : "border-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB]"
            )}
          >
            {s === "risk" ? "Risk Score" : s === "district" ? "District" : "Trend %"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((r) => (
          <div
            key={r.districtId}
            className={cn(
              "relative overflow-hidden rounded-lg border p-5 fade-in",
              r.riskLevel === "high" && "border-[#EF4444]/40 bg-[#111827] pulse-red-bg",
              r.riskLevel === "medium" && "border-[#F59E0B]/30 bg-[#111827]",
              r.riskLevel === "low" && "border-[#10B981]/30 bg-[#111827]"
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-lg font-bold">{r.districtName}</div>
                <div className="text-xs text-[#F59E0B]">{r.crimeGroupName}</div>
              </div>
              <RiskBadge level={r.riskLevel} />
            </div>
            <div className={cn(
              "mt-4 font-mono text-6xl font-bold tabular-nums",
              r.riskLevel === "high" && "text-[#EF4444] glow-red",
              r.riskLevel === "medium" && "text-[#F59E0B] glow-amber",
              r.riskLevel === "low" && "text-[#10B981] glow-green",
            )}>
              <CountUp end={r.riskScore} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[#9CA3AF]">Predicted</div>
                <div className="font-mono text-lg font-bold text-[#F9FAFB]">{r.predictedCount}</div>
              </div>
              <div>
                <div className="text-[#9CA3AF]">Last Month</div>
                <div className="font-mono text-lg font-bold text-[#9CA3AF]">{r.lastMonthCount}</div>
              </div>
            </div>
            <div className={cn(
              "mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
              r.trend === "up" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#10B981]/10 text-[#10B981]"
            )}>
              {r.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {r.trendPercent > 0 ? "+" : ""}{r.trendPercent.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-mono text-sm font-bold uppercase tracking-widest text-[#F59E0B]">
          Anomaly Alerts
        </h2>
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.alertId}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4",
                a.severity === "critical"
                  ? "border-[#EF4444]/40 bg-[#EF4444]/10"
                  : "border-[#F59E0B]/40 bg-[#F59E0B]/10"
              )}
            >
              <span className={cn(
                "inline-block h-2.5 w-2.5 rounded-full pulse-dot",
                a.severity === "critical" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
              )} />
              <div className="flex-1 text-sm">{a.message}</div>
              <span className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
                a.severity === "critical" ? "bg-[#EF4444]/20 text-[#EF4444]" : "bg-[#F59E0B]/20 text-[#F59E0B]"
              )}>
                {a.spikeMultiplier.toFixed(1)}x
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskSummary({ label, value, color }: { label: string; value: number; color: "red" | "amber" | "green" }) {
  const cls = color === "red" ? "text-[#EF4444] glow-red" : color === "amber" ? "text-[#F59E0B] glow-amber" : "text-[#10B981] glow-green";
  const border = color === "red" ? "border-[#EF4444]/40" : color === "amber" ? "border-[#F59E0B]/40" : "border-[#10B981]/40";
  return (
    <div className={cn("rounded-lg border bg-[#111827] p-5", border)}>
      <div className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">{label}</div>
      <div className={cn("mt-2 font-mono text-5xl font-bold", cls)}><CountUp end={value} /></div>
    </div>
  );
}
