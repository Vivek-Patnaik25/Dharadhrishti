import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Component, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppShell } from "@/components/dh/AppShell";
import { AuthProvider } from "@/lib/auth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0E1A] px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-[#F59E0B] glow-amber">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          The intelligence you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-md border border-[#F59E0B]/50 bg-[#F59E0B]/10 px-4 py-2 text-sm font-bold uppercase tracking-widest text-[#F59E0B]"
          >
            Return to Command
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0E1A] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Intelligence feed disrupted</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">Try reconnecting or return to command.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#0A0E1A]"
          >
            Retry
          </button>
          <a href="/" className="rounded-md border border-[#1F2937] px-4 py-2 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DHARADRISHTI — Karnataka Crime Intelligence Platform" },
      { name: "description", content: "Real-time crime analytics command center for Karnataka State Police." },
      { property: "og:title", content: "DHARADRISHTI — Karnataka Crime Intelligence" },
      { property: "og:description", content: "Real-time crime analytics command center for Karnataka State Police." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0A0E1A" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicoon-image.png", type: "image/png" },
      { rel: "shortcut icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    reportLovableError(error, { boundary: "global_error_boundary" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E1A] p-10 text-center text-[#F9FAFB]">
          <div className="mb-4 text-5xl text-[#F59E0B]">⚠</div>
          <h1 className="mb-2 text-2xl font-bold text-[#EF4444]">System Error</h1>
          <p className="mb-6 max-w-md text-sm text-[#9CA3AF]">
            {this.state.error?.message || "An unexpected system error occurred."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="rounded-lg bg-[#F59E0B] px-6 py-3 font-bold text-[#0A0E1A] transition hover:bg-[#F59E0B]/80"
          >
            Return to Command Center
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalErrorBoundary>
          <AppShell>
            <Outlet />
          </AppShell>
        </GlobalErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  );
}
