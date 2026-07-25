import { useAuth } from "./auth";

/**
 * Role-scoped data view. SHO users only see records tied to their district.
 * DIG (senior) and Analyst see statewide data (analyst is read-only, not scope-limited).
 */
export function useScope() {
  const { user } = useAuth();
  const district = user?.role === "sho" ? user.district ?? null : null;
  const isScoped = district !== null;

  function scope<T>(rows: T[], key: (row: T) => string | undefined = defaultKey): T[] {
    if (!isScoped) return rows;
    return rows.filter((r) => key(r) === district);
  }

  return { district, isScoped, scope };
}

function defaultKey(row: unknown): string | undefined {
  if (row && typeof row === "object") {
    const r = row as Record<string, unknown>;
    if (typeof r.districtName === "string") return r.districtName;
    if (typeof r.name === "string") return r.name;
  }
  return undefined;
}
