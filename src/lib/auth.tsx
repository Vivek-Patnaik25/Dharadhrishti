import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "senior" | "sho" | "analyst";

export type AuthUser = {
  username: string;
  name: string;
  role: Role;
  roleLabel: string;
  clearance: string;
  scope: string;
  district?: string;
};

type Credential = { password: string; user: AuthUser };

export const MOCK_USERS: Record<string, Credential> = {
  dig: {
    password: "dig@2026",
    user: {
      username: "dig",
      name: "DIG K. Rao",
      role: "senior",
      roleLabel: "DIG / SP",
      clearance: "L4 Clearance",
      scope: "Statewide",
    },
  },
  sho: {
    password: "sho@2026",
    user: {
      username: "sho",
      name: "Insp. A. Kumar",
      role: "sho",
      roleLabel: "Inspector / SHO",
      clearance: "L2 Clearance",
      scope: "Bengaluru Urban",
      district: "Bengaluru Urban",
    },
  },
  analyst: {
    password: "analyst@2026",
    user: {
      username: "analyst",
      name: "Analyst P. Shah",
      role: "analyst",
      roleLabel: "Analyst · Read-only",
      clearance: "L1 Clearance",
      scope: "Statewide (view-only)",
    },
  },
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  canExport: boolean;
  canInsight: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "dharadrishti.auth.user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const login: AuthContextValue["login"] = (username, password) => {
    const rec = MOCK_USERS[username.trim().toLowerCase()];
    if (!rec || rec.password !== password) return { ok: false, error: "Invalid credentials" };
    setUser(rec.user);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rec.user)); } catch {}
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const canExport = user?.role !== "analyst" && user !== null;
  const canInsight = user?.role !== "analyst" && user !== null;

  return (
    <AuthContext.Provider value={{ user, login, logout, canExport, canInsight }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
