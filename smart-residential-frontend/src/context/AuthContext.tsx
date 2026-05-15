import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getStoredEmail,
  getStoredRole,
  getStoredTenantIdentifier,
  getStoredToken,
  persistSession,
} from "@/services/api";
import { authApi } from "@/services/authService";
import { sessionApi } from "@/services/sessionService";
import { decodeJwtPayload, numericJwtClaim } from "@/utils/jwt";
import type { RegisterRequest } from "@/types";

type LoginInput = { email: string; password: string; tenantIdentifier: string };

type AuthContextValue = {
  token: string | null;
  tenantIdentifier: string | null;
  email: string | null;
  role: string | null;
  userId: number | null;
  tenantId: number | null;
  isAuthenticated: boolean;
  setTenantIdentifier: (tenantIdentifier: string) => void;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterRequest & { tenantIdentifier: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [tenantIdentifier, setTenantIdentifierState] = useState<string | null>(() =>
    getStoredTenantIdentifier()
  );
  const [email, setEmail] = useState<string | null>(() => getStoredEmail());
  const [role, setRole] = useState<string | null>(() => getStoredRole());

  useEffect(() => {
    setToken(getStoredToken());
    setTenantIdentifierState(getStoredTenantIdentifier());
    setEmail(getStoredEmail());
    setRole(getStoredRole());
  }, []);

  const claims = useMemo(() => (token ? decodeJwtPayload(token) : null), [token]);
  const userId = claims
    ? numericJwtClaim(
        claims.userId,
        claims.id,
        claims.user_id,
        claims.sub,
        claims["nameid"],
        claims["nameidentifier"],
        claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
      )
    : null;
  const tenantId = claims ? numericJwtClaim(claims.tenantId, claims.tenant_id) : null;

  const setTenantIdentifier = useCallback((id: string) => {
    const v = id.trim();
    localStorage.setItem("sr_tenant_identifier", v);
    setTenantIdentifierState(v);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const tid = input.tenantIdentifier.trim();
    localStorage.setItem("sr_tenant_identifier", tid);
    setTenantIdentifierState(tid);
    const res = await authApi.login({ email: input.email, password: input.password });
    persistSession({
      token: res.token,
      tenantIdentifier: tid,
      email: res.email,
      role: res.role,
    });
    setToken(res.token);
    setEmail(res.email);
    setRole(res.role);
  }, []);

  const register = useCallback(async (input: RegisterRequest & { tenantIdentifier: string }) => {
    const tid = input.tenantIdentifier.trim();
    localStorage.setItem("sr_tenant_identifier", tid);
    setTenantIdentifierState(tid);
    await authApi.signup({
      fullName: input.fullName,
      email: input.email,
      password: input.password,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) {
        await sessionApi.logout();
      }
    } catch {
      /* ignore */
    } finally {
      clearSession();
      setToken(null);
      setEmail(null);
      setRole(null);
      setTenantIdentifierState(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      tenantIdentifier,
      email,
      role,
      userId,
      tenantId,
      isAuthenticated: Boolean(token && tenantIdentifier),
      setTenantIdentifier,
      login,
      register,
      logout,
    }),
    [
      token,
      tenantIdentifier,
      email,
      role,
      userId,
      tenantId,
      setTenantIdentifier,
      login,
      register,
      logout,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
