import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Users, FileText, Activity } from "lucide-react";
import { networkNodes as mockNodes, networkEdges as mockEdges, type NetworkNode } from "@/mock/data";
import { PageHeader } from "@/components/dh/PageHeader";
import { ExportButton } from "@/components/dh/ExportButton";
import { InsightCard } from "@/components/dh/InsightCard";
import { useInsight } from "@/hooks/use-insight";
import { RiskBadge } from "@/components/dh/RiskBadge";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Criminal Network — DHARADRISHTI" },
      { name: "description", content: "Force-directed graph of co-accused relationships." },
    ],
  }),
  component: NetworkPage,
});

type SimNode = NetworkNode & d3.SimulationNodeDatum;
type SimEdge = { source: SimNode; target: SimNode; sharedCases: number };

function NetworkPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<NetworkNode | null>(null);
  const [graphNodes, setGraphNodes] = useState<NetworkNode[]>(mockNodes);
  const [graphEdges, setGraphEdges] = useState(mockEdges);

  // Fetch live graph data
  useEffect(() => {
    apiGet<{ nodes: NetworkNode[]; edges: typeof mockEdges; metadata: any }>("/api/network/graph", { nodes: mockNodes, edges: mockEdges, metadata: {} }).then(d => {
      if (d.nodes && d.nodes.length > 0) {
        setGraphNodes(d.nodes);
        setGraphEdges(d.edges || []);
      }
    });
  }, []);

  useEffect(() => {
    if (!svgRef.current || !wrapRef.current) return;
    const width = wrapRef.current.clientWidth;
    const height = Math.max(wrapRef.current.clientHeight || 620, 480);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.4, 3]).on("zoom", (e) => {
      g.attr("transform", e.transform.toString());
    });
    svg.call(zoom as any);

    const nodes: SimNode[] = graphNodes.map((n) => ({ ...n }));
    const edges: SimEdge[] = graphEdges
      .map((e) => {
        const srcNode = nodes.find((n) => String(n.id) === String(e.source));
        const tgtNode = nodes.find((n) => String(n.id) === String(e.target));
        if (!srcNode || !tgtNode) return null;
        return {
          source: srcNode,
          target: tgtNode,
          sharedCases: e.sharedCases || 1,
        };
      })
      .filter((e): e is SimEdge => e !== null);

    const sim = d3.forceSimulation<SimNode>(nodes)
      .force("link", d3.forceLink<SimNode, SimEdge>(edges).id((d) => d.id).distance(140))
      .force("charge", d3.forceManyBody().strength(-350))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const link = g.append("g").selectAll("line").data(edges).enter().append("line")
      .attr("stroke", "#374151")
      .attr("stroke-width", (d) => d.sharedCases * 1.6)
      .attr("stroke-opacity", 0.7)
      .on("mouseover", function () { d3.select(this).attr("stroke", "#F59E0B"); })
      .on("mouseout", function () { d3.select(this).attr("stroke", "#374151"); });

    const node = g.append("g").selectAll("g").data(nodes).enter().append("g")
      .style("cursor", "pointer")
      .call(d3.drag<any, SimNode>()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    node.append("circle")
      .attr("r", (d) => 10 + d.caseCount * 4)
      .attr("fill", (d) => d.isRepeatOffender ? "#EF4444" : "#3B82F6")
      .attr("stroke", (d) => d.isRepeatOffender ? "#EF4444" : "#3B82F6")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 8)
      .style("filter", (d) => d.isRepeatOffender ? "drop-shadow(0 0 10px #EF4444)" : "drop-shadow(0 0 6px #3B82F6)");

    node.append("text")
      .text((d) => d.name)
      .attr("y", (d) => 10 + d.caseCount * 4 + 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#F9FAFB")
      .style("font-family", "'JetBrains Mono', monospace")
      .style("font-size", "11px");

    node.append("title").text((d) => `${d.name}\n${d.caseCount} cases\n${d.primaryCrimeType}`);
    node.on("click", (_, d) => setSelected(d));

    sim.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x!)
        .attr("y1", (d) => (d.source as SimNode).y!)
        .attr("x2", (d) => (d.target as SimNode).x!)
        .attr("y2", (d) => (d.target as SimNode).y!);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      sim.stop();
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [graphNodes, graphEdges]);

  const { insight, isLoading, generate } = useInsight("network");

  return (
    <div>
      <PageHeader
        title="Criminal Network Graph"
        subtitle={`${graphNodes.length} accused • ${graphEdges.length} co-accused links • Force simulation`}
        onInsight={() => generate({ totalNodes: graphNodes.length, totalEdges: graphEdges.length, repeatOffenders: graphNodes.filter(n => n.isRepeatOffender).length })}
        isLoading={isLoading}
        right={<ExportButton targetId="network-graph" filename="criminal-network" />}
      />
      <InsightCard
        insight={insight?.text || "Criminal network topology reveals active accused nodes with confirmed repeat offenders. Co-accused cluster analysis suggests organized syndicate activity. Recommend targeted surveillance on highest betweenness-centrality nodes to disrupt network connectivity."}
        isLoading={isLoading}
      />

      <div id="network-graph" ref={wrapRef} className="relative overflow-hidden rounded-lg border border-[#1F2937] bg-[#0A0E1A] grid-bg" style={{ height: "calc(100vh - 280px)", minHeight: 480 }}>
        <svg ref={svgRef} className="h-full w-full" style={{ height: "calc(100vh - 280px)", minHeight: 480 }} />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-md border border-[#1F2937] bg-[#111827]/90 p-3 text-[11px] backdrop-blur">
          <div className="mb-2 font-mono text-[9px] font-bold uppercase tracking-widest text-[#F59E0B]">Legend</div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#EF4444]" /> Repeat Offender</div>
          <div className="mt-1 flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#3B82F6]" /> First Offender</div>
          <div className="mt-1 text-[#9CA3AF]">Line thickness = shared cases</div>
        </div>

        {selected && (
          <NodeDrawer node={selected} nodes={graphNodes} edges={graphEdges} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}

function NodeDrawer({ node, nodes, edges, onClose }: { node: NetworkNode; nodes: NetworkNode[]; edges: { source: number | string; target: number | string; sharedCases: number }[]; onClose: () => void }) {
  const [tab, setTab] = useState<"cases" | "links" | "risk">("cases");

  // Derive relationships from live edges & nodes props
  const relations = useMemo(() => {
    return edges
      .filter((e) => String(e.source) === String(node.id) || String(e.target) === String(node.id))
      .map((e) => {
        const otherId = String(e.source) === String(node.id) ? e.target : e.source;
        const other = nodes.find((n) => String(n.id) === String(otherId));
        if (!other) return null;
        const relType =
          e.sharedCases >= 3
            ? "Core Syndicate"
            : e.sharedCases === 2
            ? "Frequent Collaborator"
            : other.primaryCrimeType === node.primaryCrimeType
            ? "Same-MO Associate"
            : "Peripheral Link";
        return { other, sharedCases: e.sharedCases, relType };
      })
      .filter((r): r is { other: NetworkNode; sharedCases: number; relType: string } => r !== null)
      .sort((a, b) => b.sharedCases - a.sharedCases);
  }, [node, nodes, edges]);

  // Deterministic risk trend derived from node id
  const risk = useMemo(() => {
    const seed = node.id;
    const base = 30 + (node.caseCount * 10) + (node.isRepeatOffender ? 20 : 0);
    const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const series = months.map((m, i) => {
      const jitter = ((seed * (i + 3)) % 17) - 8;
      const drift = node.isRepeatOffender ? i * 3 : i * 1.2;
      const score = Math.max(5, Math.min(98, Math.round(base + drift + jitter)));
      return { month: m, score };
    });
    const current = series[series.length - 1].score;
    const prev = series[series.length - 2].score;
    const delta = current - prev;
    const level: "high" | "medium" | "low" =
      current >= 70 ? "high" : current >= 45 ? "medium" : "low";
    return { series, current, delta, level };
  }, [node]);

  const cases = useMemo(() => {
    const statuses = ["Open", "Under Investigation", "Charge Sheeted", "Court Trial", "Closed"];
    return Array.from({ length: node.caseCount }).map((_, i) => ({
      id: `FIR-${2000 + node.id + i * 37}`,
      type: i === 0 ? node.primaryCrimeType : ["Theft", "Assault", "Robbery", "Cyber Fraud"][(node.id + i) % 4],
      status: statuses[(node.id + i) % statuses.length],
      date: `2025-0${((node.id + i) % 7) + 1}-${((node.id * (i + 1)) % 27) + 1}`,
    }));
  }, [node]);

  const TabBtn = ({ id, label, icon: Icon }: { id: typeof tab; label: string; icon: any }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2 font-mono text-[10px] font-bold uppercase tracking-widest transition ${
        tab === id
          ? "border-[#F59E0B] text-[#F59E0B]"
          : "border-transparent text-[#9CA3AF] hover:text-[#F9FAFB]"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );

  return (
    <aside className="absolute right-0 top-0 h-full w-[360px] overflow-auto border-l border-[#F59E0B]/30 bg-[#0A0E1A]/95 backdrop-blur slide-down">
      {/* Header */}
      <div className="border-b border-[#1F2937] p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">Accused Profile</div>
            <h3 className="mt-1 font-mono text-lg font-bold">{node.name}</h3>
            <div className="mt-1 text-xs text-[#9CA3AF]">
              ID #{node.id} • Age {node.age} • {node.gender === "M" ? "Male" : "Female"}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-md border border-[#1F2937] px-2 py-1 text-xs text-[#9CA3AF] hover:text-[#F59E0B]"
          >
            ✕
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {node.isRepeatOffender && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#EF4444]/40 bg-[#EF4444]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
              <AlertTriangle className="h-3 w-3" /> Repeat Offender
            </span>
          )}
          <RiskBadge level={risk.level} />
          <span className="rounded-full border border-[#1F2937] bg-[#111827] px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#9CA3AF]">
            {node.primaryCrimeType}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1F2937] bg-[#111827]/40">
        <TabBtn id="cases" label={`Cases (${cases.length})`} icon={FileText} />
        <TabBtn id="links" label={`Links (${relations.length})`} icon={Users} />
        <TabBtn id="risk" label="Risk Trend" icon={Activity} />
      </div>

      {/* Content */}
      <div className="p-5">
        {tab === "cases" && (
          <div>
            {cases.length === 0 ? (
              <div className="rounded border border-[#1F2937] bg-[#111827] p-4 text-xs text-[#9CA3AF]">
                No FIRs linked.
              </div>
            ) : (
              cases.map((c) => (
                <div key={c.id} className="mb-2 rounded border border-[#1F2937] bg-[#111827] p-3">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="font-bold text-[#F59E0B]">{c.id}</span>
                    <span className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[#F9FAFB]">{c.type}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-[#9CA3AF]">Registered {c.date}</div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "links" && (
          <div>
            {relations.length === 0 ? (
              <div className="rounded border border-[#1F2937] bg-[#111827] p-4 text-xs text-[#9CA3AF]">
                No co-accused connections found.
              </div>
            ) : (
              relations.map((r) => {
                const relColor =
                  r.relType === "Core Syndicate"
                    ? "text-[#EF4444] border-[#EF4444]/40 bg-[#EF4444]/10"
                    : r.relType === "Frequent Collaborator"
                    ? "text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10"
                    : r.relType === "Same-MO Associate"
                    ? "text-[#3B82F6] border-[#3B82F6]/40 bg-[#3B82F6]/10"
                    : "text-[#9CA3AF] border-[#1F2937] bg-[#111827]";
                return (
                  <div key={r.other.id} className="mb-2 rounded border border-[#1F2937] bg-[#111827] p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[#F9FAFB]">{r.other.name}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${relColor}`}>
                        {r.relType}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span>{r.other.primaryCrimeType}</span>
                      <span className="font-mono">{r.sharedCases} shared FIR{r.sharedCases > 1 ? "s" : ""}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "risk" && (
          <div>
            <div className="rounded border border-[#1F2937] bg-[#111827] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">Current Risk Score</div>
                  <div className="font-mono text-4xl font-bold text-[#F59E0B] glow-amber">{risk.current}</div>
                </div>
                <div
                  className={`flex items-center gap-1 font-mono text-sm font-bold ${
                    risk.delta >= 0 ? "text-[#EF4444]" : "text-[#10B981]"
                  }`}
                >
                  {risk.delta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {risk.delta >= 0 ? "+" : ""}
                  {risk.delta}
                </div>
              </div>
              <div className="mt-3 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={risk.series} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#374151" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                    <YAxis stroke="#374151" tick={{ fill: "#9CA3AF", fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "#0A0E1A",
                        border: "1px solid #1F2937",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={2} fill="url(#riskGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 font-mono text-[10px] text-[#9CA3AF]">
                6-month projected risk trajectory
              </div>
            </div>

            <div className="mt-3 rounded border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-3 text-[11px] text-[#F9FAFB]">
              <div className="mb-1 font-mono text-[9px] font-bold uppercase tracking-widest text-[#F59E0B]">
                GLM Insight
              </div>
              {risk.level === "high"
                ? `Sustained upward trajectory. ${node.name} is escalating activity — recommend surveillance uplift.`
                : risk.level === "medium"
                ? `Moderate risk with ${risk.delta >= 0 ? "rising" : "cooling"} signal. Monitor associates in the graph.`
                : `Low current risk. Baseline monitoring sufficient.`}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
