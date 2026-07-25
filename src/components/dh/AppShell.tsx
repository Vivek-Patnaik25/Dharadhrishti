import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Map, Network, TrendingUp, Users, Shield,
  Maximize2, LogOut, Eye,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AlertTicker } from "./AlertTicker";
import { NotificationBell } from "./NotificationBell";
import { alerts as allAlerts } from "@/mock/data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useScope } from "@/lib/scope";

const NAV = [
  { to: "/dashboard", label: "Command Center", Icon: LayoutDashboard },
  { to: "/map", label: "Hotspot Map", Icon: Map },
  { to: "/network", label: "Network Graph", Icon: Network },
  { to: "/predict", label: "Predictive Risk", Icon: TrendingUp },
  { to: "/demographics", label: "Demographics", Icon: Users },
  { to: "/officers", label: "Officer Analytics", Icon: Shield },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [demo, setDemo] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [allAlertsState, setAllAlertsState] = useState(allAlerts);
  const { scope, isScoped, district } = useScope();

  useEffect(() => {
    import("@/lib/api").then(({ apiGet }) => {
      apiGet<{ alerts: typeof allAlerts }>("/api/alerts/anomalies", { alerts: allAlerts }).then(d => {
        if (d && d.alerts && d.alerts.length > 0) {
          setAllAlertsState(d.alerts);
        }
      });
    });
  }, []);

  const alerts = isScoped ? (scope(allAlertsState).length > 0 ? scope(allAlertsState) : allAlertsState) : allAlertsState;
  const active = NAV.find((n) => n.to === location.pathname) ?? NAV[0];
  const isLandingRoute = location.pathname === "/";
  const isLoginRoute = location.pathname === "/login";

  useEffect(() => {
    if (!user && !isLoginRoute && !isLandingRoute) navigate({ to: "/login" });
  }, [user, isLoginRoute, isLandingRoute, navigate]);

  if (isLandingRoute || isLoginRoute || !user) {
    return <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB]">{children}</div>;
  }

  const goFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const roleTint =
    user.role === "senior" ? "text-[#F59E0B] border-[#F59E0B]/50 bg-[#F59E0B]/10"
    : user.role === "sho" ? "text-[#10B981] border-[#10B981]/50 bg-[#10B981]/10"
    : "text-[#8B5CF6] border-[#8B5CF6]/50 bg-[#8B5CF6]/10";

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-[#F9FAFB]">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-md transition-[width] duration-200",
          expanded ? "w-[240px]" : "w-[64px]"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#F59E0B]/15 ring-1 ring-[#F59E0B]/40">
            <Eye className="h-4 w-4 text-[#F59E0B]" />
          </div>
          {expanded && (
            <div className="min-w-0">
              <div className="truncate font-mono text-xs font-bold tracking-widest text-[#F59E0B]">
                DHARADRISHTI
              </div>
              <div className="truncate text-[9px] uppercase tracking-widest text-[#4B5563]">
                ಧರಾದೃಷ್ಟಿ
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {NAV.map(({ to, label, Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                    : "text-[#9CA3AF] hover:bg-white/5 hover:text-[#F9FAFB]"
                )}
              >
                {isActive && (
                  <span className="absolute inset-y-1 left-0 w-[3px] rounded-r bg-[#F59E0B]" />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {expanded && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          {expanded ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-semibold text-[#F9FAFB]">{user.name}</div>
                <div className="truncate text-[10px] uppercase tracking-widest text-[#F59E0B]">
                  {user.clearance}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="rounded-md p-1.5 text-[#9CA3AF] hover:bg-white/5 hover:text-[#EF4444]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button onClick={handleLogout} title={`${user.name} — sign out`}>
                <div className="h-6 w-6 rounded-full bg-[#F59E0B]/20 ring-1 ring-[#F59E0B]/50" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="pl-[64px]">
        {/* Top Nav */}
        <header className="sticky top-0 z-30 border-b border-[#1F2937] bg-[#0A0E1A]/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <active.Icon className="h-4 w-4 text-[#F59E0B]" />
              <div className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#F9FAFB]">
                {active.label}
              </div>
              {demo && (
                <span className="rounded-full border border-[#F59E0B]/50 bg-[#F59E0B]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
                  Demo Mode
                </span>
              )}
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", roleTint)}>
                {user.roleLabel} · {user.scope}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                Demo
                <span
                  onClick={() => setDemo((v) => !v)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition",
                    demo ? "bg-[#F59E0B]" : "bg-[#1F2937]"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition",
                      demo ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </span>
              </label>

              <NotificationBell alerts={alerts} />
              <button
                onClick={goFullscreen}
                className="rounded-md border border-[#1F2937] p-2 text-[#9CA3AF] hover:border-[#F59E0B]/50 hover:text-[#F59E0B]"
                aria-label="TV Mode"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Heartbeat line */}
          <div className="relative h-[2px] w-full overflow-hidden bg-[#1F2937]">
            <div className="heartbeat-line absolute inset-0 bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent" />
          </div>

          {isScoped && (
            <div className="border-b border-[#10B981]/20 bg-[#10B981]/10 px-6 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#10B981]">
              Scope locked: {district} · station-level view · all queries filtered to this district
            </div>
          )}
          {user.role === "analyst" && (
            <div className="border-b border-[#8B5CF6]/20 bg-[#8B5CF6]/10 px-6 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">
              Read-only mode · exports and insight generation disabled
            </div>
          )}
        </header>

        <main className="px-6 py-6">
          <div data-demo={demo}>{children}</div>
        </main>

        <div className="sticky bottom-0 z-20">
          <AlertTicker alerts={alerts} />
        </div>
      </div>
    </div>
  );
}
