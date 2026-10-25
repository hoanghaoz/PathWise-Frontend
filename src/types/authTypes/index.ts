// Shapes of PathWise-BE /api/auth endpoints (see PathWise-BE/docs/auth-module.md).

export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  publicId: string;
  email: string;
  username: string;
  role: UserRole;
  /** ISO date-time string. */
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  /** Access token lifetime in seconds. */
  expiresIn: number;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  /** Email or username. */
  identifier: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
