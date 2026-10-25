import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { SESSION_EXPIRED_EVENT } from "../services/api";
import { authService } from "../services/authService";
import {
  clearTokens,
  getRefreshToken,
  hasSession,
  saveTokens,
} from "../services/tokenStorage";
import type {
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
} from "../types/authTypes";
import { AuthContext } from "./auth-context";
import type { AuthStatus } from "./auth-context";
import { useToast } from "./useToast";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    hasSession() ? "loading" : "guest",
  );
  const { showToast } = useToast();

  // Restore the session after a reload. The api interceptor refreshes the
  // access token by itself if it has expired.
  useEffect(() => {
    if (!hasSession()) return;
    let cancelled = false;
    authService
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        clearTokens();
        setStatus("guest");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The refresh token is no longer valid (expired, revoked, password changed
  // on another device): drop the user so protected routes go to /login.
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setStatus("guest");
      showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warn");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [showToast]);

  const login = useCallback(async (body: LoginRequest) => {
    const result = await authService.login(body);
    saveTokens(result);
    setUser(result.user);
    setStatus("authenticated");
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    clearTokens();
    setUser(null);
    setStatus("guest");
    if (refreshToken) {
      // Revoke server-side; the local session is already gone either way.
      await authService.logout(refreshToken).catch(() => undefined);
    }
  }, []);

  const changePassword = useCallback(async (body: ChangePasswordRequest) => {
    const tokens = await authService.changePassword(body);
    saveTokens(tokens);
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, changePassword }),
    [user, status, login, logout, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
