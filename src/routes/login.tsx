import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, User, ShieldCheck, ArrowLeft, ChevronDown, ChevronUp, KeyRound, Award, ShieldAlert } from "lucide-react";
import { useAuth, MOCK_USERS } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Command Access — DHARADRISHTI" },
      { name: "description", content: "Restricted access to Karnataka Police intelligence command center." },
    ],
  }),
  component: LoginPage,
});

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(username, password);
    if (!res.ok) { setError(res.error); return; }
    setError(null);
    navigate({ to: "/dashboard" });
  };

  const quickLogin = (u: string) => {
    const rec = MOCK_USERS[u];
    if (!rec) return;
    const res = login(u, rec.password);
    if (res.ok) navigate({ to: "/dashboard" });
  };

  const roleCardMeta: Record<string, { icon: typeof ShieldCheck; accent: string; badgeBg: string; borderHover: string; desc: string }> = {
    dig: {
      icon: Award,
      accent: "#F59E0B",
      badgeBg: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40",
      borderHover: "hover:border-[#F59E0B]/80 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
      desc: "Full statewide operational overview, executive intelligence reports, & PDF exports."
    },
    sho: {
      icon: ShieldCheck,
      accent: "#10B981",
      badgeBg: "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40",
      borderHover: "hover:border-[#10B981]/80 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
      desc: "District & station scoped analytics, localized FIR tracking, & officer metrics."
    },
    analyst: {
      icon: ShieldAlert,
      accent: "#8B5CF6",
      badgeBg: "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/40",
      borderHover: "hover:border-[#8B5CF6]/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]",
      desc: "Read-only access for data exploration & analytical modeling."
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center bg-[#0A0E1A] bg-cover bg-center bg-no-repeat px-4 py-8 text-[#F9FAFB]"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      {/* Dark overlay for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[#0A0E1A]/75 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-[#1F2937] bg-[#111827]/80 px-3.5 py-1.5 font-mono text-xs font-semibold text-[#9CA3AF] transition hover:border-[#F59E0B]/50 hover:text-[#F59E0B]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to System Overview</span>
          </Link>

          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#F59E0B]">
            Karnataka Police // Intelligence
          </span>
        </div>

        {/* Main Card */}
        <div className="rounded-xl border border-[#1F2937] bg-[#111827]/95 p-6 shadow-2xl backdrop-blur sm:p-8">
          {/* Header with Brand Image emblem */}
          <div className="mb-8 flex flex-col items-center text-center">
            <img
              src="/brand-image.png"
              alt="DHARADRISHTI Emblem"
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.35)] mb-3"
            />
            <h1 className="font-mono text-xl md:text-2xl font-bold tracking-tight text-[#F9FAFB]">
              AUTHENTICATE COMMAND ROLE
            </h1>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Select your authorized officer role to enter the intelligence command center
            </p>
          </div>

          {/* PRIMARY ROLE CARDS */}
          <div className="mb-6 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
              Primary Sign-In Roles
            </div>

            <div className="grid gap-3.5">
              {Object.entries(MOCK_USERS).map(([u, rec]) => {
                const meta = roleCardMeta[u] || roleCardMeta.dig;
                const IconComponent = meta.icon;
                return (
                  <button
                    type="button"
                    key={u}
                    onClick={() => quickLogin(u)}
                    className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-[#1F2937] bg-[#0A0E1A] p-4 text-left transition duration-200 ${meta.borderHover}`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1"
                        style={{ backgroundColor: `${meta.accent}15`, borderColor: `${meta.accent}40` }}
                      >
                        <IconComponent className="h-5 w-5" style={{ color: meta.accent }} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-[#F9FAFB]">
                            {rec.user.name}
                          </span>
                          <span className={`inline-flex rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${meta.badgeBg}`}>
                            {rec.user.clearance}
                          </span>
                        </div>
                        <div className="mt-0.5 font-mono text-xs font-semibold text-[#F59E0B]">
                          {rec.user.roleLabel} · Scope: {rec.user.scope}
                        </div>
                        <p className="mt-1 text-[11px] text-[#9CA3AF] line-clamp-1">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 text-right">
                      <span
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-md px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-[#0A0E1A] transition group-hover:brightness-110"
                        style={{ backgroundColor: meta.accent }}
                      >
                        <span>Authorize</span>
                        <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLLAPSIBLE MANUAL SIGN-IN SECTION */}
          <div className="border-t border-[#1F2937] pt-4">
            <button
              type="button"
              onClick={() => setShowManual((v) => !v)}
              className="flex w-full items-center justify-between py-2 text-xs font-semibold text-[#9CA3AF] transition hover:text-[#F59E0B]"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span className="uppercase tracking-wider">Manual Credentials Sign-In</span>
              </div>
              {showManual ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showManual && (
              <form onSubmit={submit} className="mt-4 space-y-4 rounded-lg border border-[#1F2937] bg-[#0A0E1A] p-4">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                    Officer Username ID
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-[#1F2937] bg-[#111827] px-3">
                    <User className="h-4 w-4 text-[#4B5563]" />
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-xs text-[#F9FAFB] outline-none"
                      placeholder="e.g. dig, sho, analyst"
                      autoComplete="username"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                    Security Passphrase
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-[#1F2937] bg-[#111827] px-3">
                    <Lock className="h-4 w-4 text-[#4B5563]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent py-2.5 text-xs text-[#F9FAFB] outline-none"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                </label>

                {error && (
                  <div className="rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-2 text-xs text-[#EF4444]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-md bg-[#F59E0B] py-2.5 text-xs font-bold uppercase tracking-widest text-[#0A0E1A] transition hover:brightness-110"
                >
                  Authenticate Officer Credentials
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#6B7280]">
          Restricted Access · Karnataka State Police Department
        </footer>
      </div>
    </div>
  );
}
