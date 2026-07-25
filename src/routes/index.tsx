import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, ChevronRight, Radio } from "lucide-react";
import { useAuth, MOCK_USERS } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DHARADRISHTI — Vision over the Land" },
      { name: "description", content: "Karnataka State Police · Crime Intelligence Platform" },
    ],
  }),
  component: SimpleLandingPage,
});

function SimpleLandingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(false);

  const handleAccess = () => {
    setInitializing(true);
    setTimeout(() => {
      if (user) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/login" });
      }
    }, 600);
  };

  return (
    <div
      className="relative flex h-screen w-screen flex-col justify-between overflow-hidden bg-[#0A0E1A] bg-cover bg-center bg-no-repeat px-6 py-6 text-[#F9FAFB] selection:bg-[#F59E0B]/30 selection:text-[#F59E0B]"
      style={{ backgroundImage: "url('/landingpage-bg.png')" }}
    >
      {/* Dark overlay for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-[#0A0E1A]/75 backdrop-blur-[2px]" />

      {/* Top Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/favicoon-image.png"
            alt="DHARADRISHTI Logo"
            className="h-9 w-9 rounded-md object-contain p-0.5 ring-1 ring-[#F59E0B]/40"
          />
          <span className="font-mono text-xs font-bold tracking-[0.25em] text-[#F59E0B]">
            DHARADRISHTI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-3.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#10B981]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Karnataka Police // Intelligence
          </span>
        </div>
      </header>

      {/* Main Center Content (Simple & Clean) */}
      <main className="relative z-10 mx-auto my-auto flex flex-1 flex-col items-center justify-center text-center max-w-2xl px-4 py-8">
        {/* Brand Emblem */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#F59E0B]/30 to-transparent blur-2xl opacity-75" />
          <img
            src="/brand-image.png"
            alt="DHARADRISHTI Brand Logo"
            className="relative h-44 md:h-52 w-auto max-w-[320px] object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.5)] transition duration-500 hover:scale-105"
          />
        </div>

        {/* Title & Tagline */}
        <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-[#F9FAFB] mb-2 drop-shadow-md">
          ಧರಾದೃಷ್ಟಿ
        </h1>
        <div className="font-mono text-sm md:text-base font-bold tracking-[0.25em] text-[#F59E0B] uppercase mb-2">
          Vision over the Land
        </div>
        <p className="font-mono text-xs md:text-sm text-[#9CA3AF] tracking-widest mb-8">
          Karnataka State Police · Crime Intelligence Platform
        </p>

        {/* Single Authoritative CTA Button */}
        <button
          onClick={handleAccess}
          className="group relative inline-flex items-center gap-3 overflow-hidden rounded-md bg-[#F59E0B] px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] text-[#0A0E1A] shadow-[0_0_30px_rgba(245,158,11,0.45)] transition hover:bg-[#F59E0B]/90 hover:scale-105 active:scale-95"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>ACCESS COMMAND CENTER</span>
          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[#6B7280] py-2">
        Restricted Access · Karnataka Police Department · Confidential
      </footer>

      {/* Smooth Initialization Overlay */}
      {initializing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0E1A]/90 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-lg border border-[#F59E0B]/40 bg-[#111827] p-6 text-center font-mono shadow-2xl">
            <Radio className="mx-auto mb-3 h-6 w-6 text-[#F59E0B] animate-pulse" />
            <div className="text-xs font-bold uppercase tracking-widest text-[#F59E0B] mb-2">
              DHARADRISHTI v2.0
            </div>
            <div className="text-xs text-[#9CA3AF] mb-4">
              Initializing Intelligence Modules...
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#0A0E1A]">
              <div className="h-full bg-[#F59E0B] animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
