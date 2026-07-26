import { USE_MOCK, BASE_URL } from "../config";

/**
 * DHARADRISHTI — Centralized API Client
 * Dynamically supports direct paths for local dev and query path routing for Catalyst API Gateway.
 */

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  try {
    const raw = sessionStorage.getItem("dharadrishti.auth.user");
    if (raw) {
      const user = JSON.parse(raw);
      const roleMap: Record<string, string> = {
        senior: "senior_officer",
        sho: "station_officer",
        analyst: "senior_officer",
      };
      headers["x-user-role"] = roleMap[user.role] || "senior_officer";
      if (user.unitId) headers["x-user-unit-id"] = String(user.unitId);
      if (user.districtId) headers["x-user-district-id"] = String(user.districtId);
    }
  } catch {}
  return headers;
}

function buildUrl(path: string): string {
  if (BASE_URL.includes("localhost")) {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}?path=${encodeURIComponent(path)}`;
}

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCK) return fallback;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(buildUrl(path), {
      headers: getAuthHeaders(),
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      console.warn(`[API] GET ${path} timed out after 15s`);
    } else {
      console.warn(`[API] GET ${path} failed, using fallback`, err);
    }
    return fallback;
  }
}

export async function apiPost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  if (USE_MOCK) return fallback;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(buildUrl(path), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(id);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return await res.json();
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === 'AbortError') {
      console.warn(`[API] POST ${path} timed out`);
    } else {
      console.warn(`[API] POST ${path} failed, using fallback`, err);
    }
    return fallback;
  }
}
