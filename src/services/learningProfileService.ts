import api from "./api";
import type { ApiSuccessResponse } from "../types/commonTypes";
import type {
  CreateLearningProfileRequest,
  LearningProfile,
  UpdateLearningProfileRequest,
} from "../types/learningProfileTypes";

// Thin wrappers over PathWise-BE /api/learning-profile. The user comes from
// the token, so no user id is ever sent.

export const learningProfileService = {
  /** Onboarding: only once per user (409 if a profile already exists). */
  async create(
    body: CreateLearningProfileRequest,
  ): Promise<{ publicId: string }> {
    const { data } = await api.post<ApiSuccessResponse<{ publicId: string }>>(
      "/learning-profile",
      body,
    );
    return data.data;
  },

  /** 404 means the user has not onboarded yet. */
  async getMine(): Promise<LearningProfile> {
    const { data } = await api.get<ApiSuccessResponse<LearningProfile>>(
      "/learning-profile/me",
    );
    return data.data;
  },

  /** Returns the updated profile, so no GET is needed afterwards. */
  async updateMine(
    body: UpdateLearningProfileRequest,
  ): Promise<LearningProfile> {
    const { data } = await api.patch<ApiSuccessResponse<LearningProfile>>(
      "/learning-profile/me",
      body,
    );
    return data.data;
  },
};
