import { useState, useEffect, useCallback, useRef } from "react";
import type { AuthUser } from "@workspace/api-client-react";
export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

async function fetchUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/user", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: AuthUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    fetchUser().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("auth_pending") === "1") {
      sessionStorage.removeItem("auth_pending");
      setIsLoading(true);
      fetchUser().then((u) => {
        setUser(u);
        setIsLoading(false);
      });
    }
  }, []);

  const login = useCallback(() => {
    sessionStorage.setItem("auth_pending", "1");
    window.location.href = "/api/login?returnTo=/";
  }, []);

  const logout = useCallback(() => {
    window.location.href = "/api/logout";
  }, []);

  return { user, isLoading, isAuthenticated: !!user, login, logout };
}
