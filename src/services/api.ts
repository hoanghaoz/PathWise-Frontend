import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import type { ApiSuccessResponse } from "../types/commonTypes";
import type { AuthTokens } from "../types/authTypes";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./tokenStorage";

/** Fired when the session cannot be refreshed; AuthProvider listens to it. */
export const SESSION_EXPIRED_EVENT = "pathwise:session-expired";

// Endpoints that must never trigger a token refresh: they either do not use
// the access token or are the refresh itself.
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
];

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// One refresh at a time: the backend rotates refresh tokens (each one works
// once), so parallel 401s must share the same refresh request.
let refreshing: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  refreshing ??= (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token");
    }
    // Plain axios (not `api`) so this call skips the interceptors.
    const { data } = await axios.post<ApiSuccessResponse<AuthTokens>>(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    );
    saveTokens(data.data);
    return data.data.accessToken;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const url = original?.url ?? "";
    const canRefresh =
      error.response?.status === 401 &&
      original !== undefined &&
      !original._retried &&
      !NO_REFRESH_PATHS.some((path) => url.includes(path));

    if (!canRefresh) {
      return Promise.reject(error);
    }

    original._retried = true;
    try {
      const accessToken = await refreshAccessToken();
      original.headers.set("Authorization", `Bearer ${accessToken}`);
      return api(original);
    } catch {
      clearTokens();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      return Promise.reject(error);
    }
  },
);

export default api;
