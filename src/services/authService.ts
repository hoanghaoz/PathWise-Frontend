import api from "./api";
import type { ApiSuccessResponse } from "../types/commonTypes";
import type {
  AuthTokens,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
} from "../types/authTypes";

// Thin wrappers over PathWise-BE /api/auth. Each returns the unwrapped `data`
// of ApiSuccessResponse and throws AxiosError on failure (see handleApiError).

export const authService = {
  async register(body: RegisterRequest): Promise<AuthUser> {
    const { data } = await api.post<ApiSuccessResponse<AuthUser>>(
      "/auth/register",
      body,
    );
    return data.data;
  },

  async login(body: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<ApiSuccessResponse<LoginResponse>>(
      "/auth/login",
      body,
    );
    return data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(body: ResetPasswordRequest): Promise<void> {
    await api.post("/auth/reset-password", body);
  },

  /** Returns a new token pair; the backend logs out every other session. */
  async changePassword(body: ChangePasswordRequest): Promise<AuthTokens> {
    const { data } = await api.post<ApiSuccessResponse<AuthTokens>>(
      "/auth/change-password",
      body,
    );
    return data.data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<ApiSuccessResponse<AuthUser>>("/auth/me");
    return data.data;
  },
};
