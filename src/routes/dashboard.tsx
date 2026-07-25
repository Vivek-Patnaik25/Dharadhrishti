import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  FileText, UserCheck, AlertTriangle, Scale, FileDown,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { KPICard } from "@/components/dh/KPICard";
import { PageHeader } from "@/components/dh/PageHeader";
import { InsightCard } from "@/components/dh/InsightCard";
import { ExportButton } from "@/components/dh/ExportButton";
import { PdfProgressOverlay } from "@/components/dh/PdfProgressOverlay";
import { useAuth } from "@/lib/auth";
import { useScope } from "@/lib/scope";
import { useInsight } from "@/hooks/use-insight";
import { apiGet } from "@/lib/api";
import { overview as mockOverview, trend as mockTrend, crimeTypes as mockCrimeTypes, statusFunnel as mockStatusFunnel, alerts as mockAlerts, riskScores as mockRiskScores } from "@/mock/data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Command Center — DHARADRISHTI" },
      { name: "description", content: "Live crime intelligence overview for Karnataka." },
    ],
  }),
  component: CommandCenter,
});

const PIE_COLORS = ["#F59E0B", "#EF4444", "#10B981", "#F97316", "#8B5CF6", "#6B7280"];

function ChartTooltip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-[#F59E0B]/50 bg-[#1A2236] px-3 py-2 text-xs shadow-xl">
      {label && <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[#F59E0B]">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="text-[#F9FAFB]">
          <span className="text-[#9CA3AF]">{p.name}:</span>{" "}
          <span className="font-mono font-bold">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function CommandCenter() {
  const { canExport } = useAuth();
  const { scope, isScoped, district } = useScope();
  const { insight, isLoading, generate } = useInsight("command_center");

  // Initial loading state prevents mock data flash
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<typeof mockOverview | null>(null);
  const [trend, setTrend] = useState(mockTrend);
  const [crimeTypes, setCrimeTypes] = useState(mockCrimeTypes);
  const [statusFunnel, setStatusFunnel] = useState(mockStatusFunnel);
  const [alertsData, setAlertsData] = useState(mockAlerts);
  const [riskScoresData, setRiskScoresData] = useState(mockRiskScores);

  // PDF Export state
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStep, setPdfStep] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      apiGet("/api/overview", mockOverview),
      apiGet<{ trend: typeof mockTrend }>("/api/crimes/trend", { trend: mockTrend }),
      apiGet<{ crimeTypes: typeof mockCrimeTypes }>("/api/crimes/by-type", { crimeTypes: mockCrimeTypes }),
      apiGet<{ funnel: { statusId: number; statusName: string; count: number }[] }>("/api/crimes/status-funnel", { funnel: mockStatusFunnel.map((s, i) => ({ statusId: i, ...s })) }),
      apiGet<{ alerts: typeof mockAlerts }>("/api/alerts/anomalies", { alerts: mockAlerts }),
      apiGet<{ predictions: typeof mockRiskScores }>("/api/predict/risk-scores", { predictions: mockRiskScores })
    ]).then(([ov, tr, ct, fn, al, rsk]) => {
      if (!isMounted) return;
      setOverview(ov);
      setTrend(tr.trend);
      setCrimeTypes(ct.crimeTypes);
      setStatusFunnel(fn.funnel.map(f => ({ statusName: f.statusName, count: f.count })));
      setAlertsData(al.alerts || []);
      setRiskScoresData(rsk.predictions || []);
      setLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setOverview(mockOverview);
      setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  const alerts = scope(alertsData);
  const riskScores = scope(riskScoresData);

  const exportDistrictReport = async () => {
    setPdfGenerating(true);
    setPdfProgress(10);
    setPdfStep("Capturing Executive Summary...");

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      await document.fonts.ready;

      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();

      const drawHeader = (pageTitle: string) => {
        doc.setFillColor(10, 14, 26);
        doc.rect(0, 0, W, H, "F");

        doc.setFillColor(17, 24, 39);
        doc.rect(0, 0, W, 70, "F");
        doc.setTextColor(245, 158, 11);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("DHARADRISHTI", 40, 34);
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text("Karnataka Police // Intelligence", 40, 50);
        doc.setTextColor(249, 250, 251);
        doc.setFontSize(13);
        doc.text(pageTitle, W - 40, 42, { align: "right" });
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(1);
        doc.line(40, 78, W - 40, 78);
      };

      const captureElementToCanvas = async (elementId: string) => {
        const el = document.getElementById(elementId);
        if (!el) return null;
        return await html2canvas(el, {
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
            const clonedElement = clonedDoc.getElementById(elementId);
            if (clonedElement) {
              clonedElement.style.background = "#0A0E1A";
              clonedElement.style.color = "#F9FAFB";
            }
          }
        });
      };

      drawHeader("EXECUTIVE SUMMARY REPORT");
      doc.setFontSize(22);
      doc.setTextColor(245, 158, 11);
      doc.text("CRIME INTELLIGENCE DOSSIER", 40, 130);
      doc.setFontSize(12);
      doc.setTextColor(249, 250, 251);
      doc.text(`Jurisdiction Scope: ${district || "Statewide Karnataka"}`, 40, 155);
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(10);
      doc.text(`Generated At: ${new Date().toLocaleString("en-IN")}`, 40, 175);
      doc.text(`Classification: OFFICIAL LAW ENFORCEMENT // CONFIDENTIAL`, 40, 190);

      const kpiCanvas = await captureElementToCanvas("kpi-section");
      if (kpiCanvas) {
        const imgData = kpiCanvas.toDataURL("image/png");
        const imgW = W - 80;
        const imgH = (kpiCanvas.height * imgW) / kpiCanvas.width;
        doc.addImage(imgData, "PNG", 40, 220, imgW, Math.min(imgH, H - 260));
      }

      setPdfProgress(40);
      setPdfStep("Rendering Crime Trend & Distribution...");
      doc.addPage();
      drawHeader("TEMPORAL & CATEGORICAL TRENDS");
      const trendCanvas = await captureElementToCanvas("trend-section");
      if (trendCanvas) {
        const imgData = trendCanvas.toDataURL("image/png");
        const imgW = W - 80;
        const imgH = (trendCanvas.height * imgW) / trendCanvas.width;
        doc.addImage(imgData, "PNG", 40, 100, imgW, Math.min(imgH, H - 140));
      }

      setPdfProgress(70);
      setPdfStep("Compiling Investigation Funnel & Alerts...");
      doc.addPage();
      drawHeader("INVESTIGATION STATUS & ANOMALIES");
      const funnelCanvas = await captureElementToCanvas("funnel-section");
      if (funnelCanvas) {
        const imgData = funnelCanvas.toDataURL("image/png");
        const imgW = W - 80;
        const imgH = (funnelCanvas.height * imgW) / funnelCanvas.width;
        doc.addImage(imgData, "PNG", 40, 100, imgW, Math.min(imgH, H - 140));
      }

      setPdfProgress(90);
      setPdfStep("Finalizing Predictive Risk Assessment...");
      doc.addPage();
      drawHeader("PREDICTIVE RISK SCORECARD");
      const alertsCanvas = await captureElementToCanvas("alerts-section");
      if (alertsCanvas) {
        const imgData = alertsCanvas.toDataURL("image/png");
        const imgW = W - 80;
        const imgH = (alertsCanvas.height * imgW) / alertsCanvas.width;
        doc.addImage(imgData, "PNG", 40, 100, imgW, Math.min(imgH, H - 140));
      }

      setPdfProgress(100);
      setPdfStep("Saving PDF Dossier...");
      doc.save(`DHARADRISHTI_Intelligence_Report_${(district || "Statewide").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("District Intelligence Dossier downloaded successfully");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF report: " + err.message);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (loading || !overview) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#0A0E1A] text-center">
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F59E0B]/10 ring-1 ring-[#F59E0B]/40">
          <img src="/favicoon-image.png" alt="Loading" className="h-10 w-10 animate-pulse object-contain" />
          <div className="absolute -inset-1 rounded-2xl border border-[#F59E0B]/40 animate-ping opacity-25" />
        </div>
        <div className="font-mono text-sm font-bold tracking-[0.25em] text-[#F59E0B]">
          INITIALIZING INTELLIGENCE FEED...
        </div>
        <div className="mt-2 text-xs text-[#9CA3AF]">
          Retrieving real-time ZCQL records from DataStore
        </div>
      </div>
    );
  }

  const defaultInsightText = `Statewide intelligence summary: ${overview.totalFIRs.toLocaleString()} active FIRs with ${overview.heinousCount} heinous cases require prioritized investigation. Chargesheet rate of ${overview.chargesheetRate}% is at operational benchmarks — maintain rigorous investigative protocols.`;

  return (
    <div className="space-y-6">
      <PdfProgressOverlay open={pdfGenerating} progress={pdfProgress} stage={pdfStep} />

      <PageHeader
        title="Command Center"
        subtitle={isScoped ? `Filtered view — ${district} jurisdiction` : "Real-time state crime intelligence overview"}
        onInsight={() => generate({ totalFIRs: overview.totalFIRs, heinousCount: overview.heinousCount, chargesheetRate: overview.chargesheetRate })}
        right={
          <button
            onClick={exportDistrictReport}
            disabled={!canExport || pdfGenerating}
            className="inline-flex items-center gap-2 rounded-md border border-[#F59E0B]/50 bg-[#F59E0B]/10 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#F59E0B] transition hover:bg-[#F59E0B] hover:text-[#0A0E1A] disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            Export Report (PDF)
          </button>
        }
      />

      <InsightCard
        insight={insight?.text || defaultInsightText}
        isLoading={isLoading}
      />

      {/* KPI Section */}
      <div id="kpi-section" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Recorded FIRs"
          value={overview.totalFIRs}
          subtitle={`${overview.heinousCount} heinous (${Math.round((overview.heinousCount / overview.totalFIRs) * 100)}%)`}
          Icon={FileText}
          color="amber"
        />
        <KPICard
          title="Arrest Rate"
          value={overview.arrestRate}
          suffix="%"
          decimals={1}
          subtitle="Unique accused detained"
          Icon={UserCheck}
          color="green"
        />
        <KPICard
          title="Chargesheet Rate"
          value={overview.chargesheetRate}
          suffix="%"
          decimals={1}
          subtitle={`${overview.falseCases} false / ${overview.undetectedCases} undetected`}
          Icon={Scale}
          color="amber"
        />
        <KPICard
          title="Active Anomalies"
          value={alerts.length}
          subtitle={`${alerts.filter((a) => a.severity === "critical").length} critical spikes`}
          Icon={AlertTriangle}
          color={alerts.some((a) => a.severity === "critical") ? "red" : "amber"}
        />
      </div>

      {/* Trend & Category Distribution */}
      <div id="trend-section" className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-[#1F2937] bg-[#111827] p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#F9FAFB]">
                Crime Volume Trend (19 Months)
              </h2>
              <p className="text-xs text-[#9CA3AF]">Statewide FIR registrations per month</p>
            </div>
            <ExportButton targetId="trend-section" filename="crime-trend" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="count" name="FIRs" stroke="#F59E0B" strokeWidth={2} fill="url(#amberGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#F9FAFB]">
                Crime Categories
              </h2>
              <p className="text-xs text-[#9CA3AF]">Breakdown by Crime Head</p>
            </div>
            <ExportButton targetId="trend-section" filename="crime-categories" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={crimeTypes} dataKey="count" nameKey="crimeGroupName" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                  {crimeTypes.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend formatter={(val) => <span className="text-[10px] text-[#9CA3AF]">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Case Status & Anomalies Section */}
      <div id="funnel-section" className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#F9FAFB]">
                Case Status Funnel
              </h2>
              <p className="text-xs text-[#9CA3AF]">Lifecycle distribution of recorded FIRs</p>
            </div>
            <ExportButton targetId="funnel-section" filename="case-funnel" />
          </div>
          <div className="space-y-3">
            {statusFunnel.map((item, idx) => {
              const pct = Math.round((item.count / overview.totalFIRs) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#F9FAFB]">{item.statusName}</span>
                    <span className="font-mono text-[#F59E0B]">
                      {item.count.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#1F2937]">
                    <div className="h-full bg-[#F59E0B] transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="alerts-section" className="rounded-lg border border-[#1F2937] bg-[#111827] p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#F9FAFB]">
                Predictive Anomalies & Risk
              </h2>
              <p className="text-xs text-[#9CA3AF]">High priority alerts across districts</p>
            </div>
            <ExportButton targetId="alerts-section" filename="risk-alerts" />
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <div key={a.alertId} className="flex items-start justify-between rounded-md border border-[#1F2937] bg-[#0A0E1A] p-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${a.severity === "critical" ? "bg-[#EF4444] animate-pulse" : "bg-[#F59E0B]"}`} />
                    <span className="font-mono font-bold text-[#F9FAFB]">{a.districtName}</span>
                    <span className="text-[#9CA3AF]">· {(a as any).crimeSubHeadName || (a as any).crimeSubHead || "Cyber Fraud"}</span>
                  </div>
                  <p className="text-[#9CA3AF]">{a.message}</p>
                </div>
                <div className="font-mono font-bold text-[#F59E0B]">{a.spikeMultiplier}x Spike</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
