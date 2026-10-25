import type { AuthTokens } from "../types/authTypes";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// localStorage keeps the session across reloads. Anything running on this
// origin can read it, so never render untrusted HTML (no dangerouslySetInnerHTML).

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const saveTokens = (
  tokens: Pick<AuthTokens, "accessToken" | "refreshToken">,
): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const hasSession = (): boolean =>
  getAccessToken() !== null || getRefreshToken() !== null;
