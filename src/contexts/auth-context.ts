import { createContext } from "react";

import type {
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
} from "../types/authTypes";

/**
 * - `loading`: a stored session is being checked with GET /auth/me.
 * - `authenticated`: `user` is set.
 * - `guest`: no valid session.
 */
export type AuthStatus = "loading" | "authenticated" | "guest";

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (body: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
  changePassword: (body: ChangePasswordRequest) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
