import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { karnatakaDistricts as mockDistricts } from "@/mock/data";
import { PageHeader } from "@/components/dh/PageHeader";
import { InsightCard } from "@/components/dh/InsightCard";
import { useInsight } from "@/hooks/use-insight";
import { useScope } from "@/lib/scope";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Hotspot Map — DHARADRISHTI" },
      { name: "description", content: "Geospatial crime hotspot heatmap for Karnataka." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { scope, isScoped, district } = useScope();
  const [karnatakaDistricts, setKarnatakaDistricts] = useState(mockDistricts);
  const districts = scope(karnatakaDistricts);

  useEffect(() => {
    apiGet<{ districtDensity: { districtId: number; districtName: string; count: number; densityLevel: string }[] }>("/api/crimes/hotspots", { districtDensity: [] }).then(d => {
      if (d.districtDensity && d.districtDensity.length > 0) {
        // Merge live counts with mock lat/lng (backend doesn't have district centroids)
        const updated = mockDistricts.map(md => {
          const live = d.districtDensity.find(dd => dd.districtName === md.name);
          return live ? { ...md, count: live.count, density: live.densityLevel as "high" | "medium" | "low" } : md;
        });
        setKarnatakaDistricts(updated);
      }
    });
  }, []);

  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<typeof mockDistricts[number] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;
    let map: any;
    let cleanup = () => {};
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet.heat");
      if (!mapRef.current) return;

      // Anchor bounds: statewide OR the scoped district's local bounding box
      const anchor = isScoped && districts[0]
        ? {
            center: [districts[0].lat, districts[0].lng] as [number, number],
            zoom: 11,
            fit: L.latLngBounds(
              [districts[0].lat - 0.35, districts[0].lng - 0.4],
              [districts[0].lat + 0.35, districts[0].lng + 0.4],
            ),
            max: L.latLngBounds(
              [districts[0].lat - 0.6, districts[0].lng - 0.7],
              [districts[0].lat + 0.6, districts[0].lng + 0.7],
            ),
            minZoom: 9,
          }
        : {
            center: [15.3173, 75.7139] as [number, number],
            zoom: 8,
            fit: L.latLngBounds([11.6, 74.1], [18.4, 78.5]),
            max: L.latLngBounds([11.5, 74.0], [18.5, 78.6]),
            minZoom: 7,
          };

      map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        minZoom: anchor.minZoom,
        maxZoom: 14,
        maxBounds: anchor.max,
        maxBoundsViscosity: 1.0,
      }).setView(anchor.center, anchor.zoom);
      map.fitBounds(anchor.fit, { padding: [10, 10] });
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      requestAnimationFrame(() => map.invalidateSize());
      setTimeout(() => map.invalidateSize(), 300);
      const ro = new ResizeObserver(() => {
        if (map && (map as any)._container) {
          map.invalidateSize();
        }
      });
      ro.observe(mapRef.current);

      // Heat points: statewide random OR clustered around the scoped district
      const points: [number, number, number][] = isScoped && districts[0]
        ? Array.from({ length: 40 }, () => [
            districts[0].lat + (Math.random() - 0.5) * 0.5,
            districts[0].lng + (Math.random() - 0.5) * 0.6,
            Math.random(),
          ])
        : Array.from({ length: 60 }, () => [
            11.5 + Math.random() * 7,
            74.0 + Math.random() * 4.5,
            Math.random(),
          ]);
      (L as any).heatLayer(points, {
        radius: 28,
        blur: 22,
        maxZoom: 10,
        gradient: { 0.2: "#10B981", 0.5: "#F59E0B", 0.8: "#EF4444" },
      }).addTo(map);

      districts.forEach((d) => {
        const color = d.density === "high" ? "#EF4444" : d.density === "medium" ? "#F59E0B" : "#10B981";
        const radius = d.density === "high" ? 18000 : d.density === "medium" ? 12000 : 8000;
        const marker = L.circle([d.lat, d.lng], {
          radius,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.35,
        }).addTo(map);
        marker.bindPopup(
          `<div style="font-family:'JetBrains Mono',monospace"><b style="color:#F59E0B">${d.name}</b><br/>${d.count} cases<br/><span style="color:#9CA3AF">${d.density.toUpperCase()} density</span></div>`
        );
        marker.on("click", () => setSelected(d));
      });

      cleanup = () => {
        ro.disconnect();
        map.remove();
      };
    })();
    return () => cleanup();
  }, [mounted, isScoped, districts]);


  const { insight, isLoading, generate } = useInsight("map");

  return (
    <div>
      <PageHeader
        title="Geospatial Hotspot Map"
        subtitle={isScoped ? `${district} • station-scoped heatmap • CartoDB dark tiles` : "Live heatmap • 30 districts • CartoDB dark tiles"}
        onInsight={() => generate({ districtName: district, totalHotspots: districts.length })}
        isLoading={isLoading}
      />
      <InsightCard
        insight={insight?.text || "Geospatial hotspot analysis confirms crime density concentration in urban corridor zones. Patrol resource optimization should prioritize top high-density clusters for maximum deterrence impact."}
        isLoading={isLoading}
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#1F2937] bg-[#111827] p-3">
        {["All Crime Types", "Heinous Only", "Non-Heinous", "Last 30 Days"].map((f, i) => (
          <button
            key={i}
            className="rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-3 py-1 text-xs text-[#F59E0B] hover:bg-[#F59E0B]/15"
          >
            {f}
          </button>
        ))}
        <div className="ml-auto text-[10px] uppercase tracking-widest text-[#4B5563]">
          Showing {districts.length} district{districts.length === 1 ? "" : "s"} • {isScoped ? "40" : "60"} hotspots
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-[#1F2937] bg-[#111827]">
        <div ref={mapRef} className="h-[70vh] w-full" />
        {selected && (
          <aside className="absolute right-0 top-0 h-full w-[320px] overflow-auto border-l border-[#F59E0B]/30 bg-[#0A0E1A]/95 p-5 backdrop-blur slide-down">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
                  District Drilldown
                </div>
                <h3 className="mt-1 font-mono text-xl font-bold">{selected.name}</h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-md border border-[#1F2937] px-2 py-1 text-xs text-[#9CA3AF] hover:text-[#F59E0B]"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 rounded-md border border-[#1F2937] bg-[#111827] p-4">
              <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">Total Cases</div>
              <div className="font-mono text-4xl font-bold text-[#F59E0B] glow-amber">
                {selected.count}
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
                Top Crime Types
              </div>
              {[
                { name: "Theft", pct: 42 },
                { name: "Assault", pct: 28 },
                { name: "Cyber Fraud", pct: 18 },
              ].map((c) => (
                <div key={c.name} className="mb-2">
                  <div className="flex justify-between text-xs">
                    <span>{c.name}</span>
                    <span className="font-mono text-[#F59E0B]">{c.pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#1F2937]">
                    <div className="h-full bg-[#F59E0B]" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
                Recent FIRs
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                {["FIR-2451 • Theft • Open", "FIR-2447 • Assault • Charged", "FIR-2441 • Fraud • Open", "FIR-2438 • Robbery • Closed", "FIR-2431 • Theft • Charged"].map((f) => (
                  <div key={f} className="rounded border border-[#1F2937] bg-[#111827] px-2 py-1.5 text-[#9CA3AF]">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
