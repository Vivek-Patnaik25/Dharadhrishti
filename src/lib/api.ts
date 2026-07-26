import { USE_MOCK, BASE_URL } from "../config";

/**
 * DHARADRISHTI — Centralized API Client
 * Includes robust failover between function URL and API Gateway endpoint,
 * 15s timeout protection, and non-blocking fallback handling.
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

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCK) return fallback;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 15000);

  const primaryUrl = `${BASE_URL}${path}`;
  const gatewayUrl = `https://dharadhristi-60079561238.development.catalystserverless.in/server/IO/execute?path=${encodeURIComponent(path)}`;

  try {
    // 1. Try primary URL
    let res = await fetch(primaryUrl, {
      headers: getAuthHeaders(),
      signal: controller.signal
    }).catch(() => null);

    // 2. If primary fails or returns non-200, try API Gateway route
    if (!res || !res.ok) {
      res = await fetch(gatewayUrl, {
        headers: getAuthHeaders(),
        signal: controller.signal
      }).catch(() => null);
    }

    clearTimeout(id);
    if (!res || !res.ok) {
      console.warn(`[API] GET ${path} failed on all endpoints, using fallback`);
      return fallback;
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(id);
    console.warn(`[API] GET ${path} error:`, err);
    return fallback;
  }
}

export async function apiPost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  if (USE_MOCK) return fallback;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 20000);

  const primaryUrl = `${BASE_URL}${path}`;
  const gatewayUrl = `https://dharadhristi-60079561238.development.catalystserverless.in/server/IO/execute?path=${encodeURIComponent(path)}`;

  try {
    let res = await fetch(primaryUrl, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
      signal: controller.signal
    }).catch(() => null);

    if (!res || !res.ok) {
      res = await fetch(gatewayUrl, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal
      }).catch(() => null);
    }

    clearTimeout(id);
    if (!res || !res.ok) {
      console.warn(`[API] POST ${path} failed on all endpoints, using fallback`);
      return fallback;
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(id);
    console.warn(`[API] POST ${path} error:`, err);
    return fallback;
  }
}
