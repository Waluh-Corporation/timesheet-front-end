"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api, setToken, clearToken, getToken, setRefreshToken, getRefreshToken, clearAuthTokens } from "./api";
import { unsubscribePush } from "./push";
import type { User, LoginResponse } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithPassword: (identifier: string, password: string) => Promise<User>;
  loginWithToken: (token: string, user: User, refreshToken?: string) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken() && !getRefreshToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api<User>("/api/v1/me");
      setUser(me);
    } catch {
      setUser(null);
      clearAuthTokens();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loginWithPassword = useCallback(
    async (identifier: string, password: string) => {
      const res = await api<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ identifier, password }),
      });
      setToken(res.token);
      if (res.refresh_token) {
        setRefreshToken(res.refresh_token);
      }
      let userData = res.user;
      if (!userData) {
        userData = await api<User>("/api/v1/me");
      }
      setUser(userData);
      return userData;
    },
    []
  );

  const loginWithToken = useCallback((token: string, u: User, refreshToken?: string) => {
    setToken(token);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    const rf = getRefreshToken();
    try {
      await Promise.race([
        unsubscribePush(),
        new Promise<void>((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch {
      // Ignore push unsubscribe errors to ensure logout always succeeds
    }
    try {
      await api("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token: rf || undefined }),
      });
    } catch {
      // Ignore backend logout network errors to ensure client cleanup always succeeds
    } finally {
      clearAuthTokens();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithPassword, loginWithToken, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
