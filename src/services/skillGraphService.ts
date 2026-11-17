import api from "./api";
import type { ApiSuccessResponse } from "../types/commonTypes";
import type {
  CreatePrerequisiteRequest,
  Direction,
  DirectionSkillGraph,
  SkillEdge,
} from "../types/skillGraphTypes";

// Thin wrappers over PathWise-BE skill graph endpoints. Each returns the
// unwrapped `data` and throws AxiosError on failure (see handleApiError).

export const skillGraphService = {
  /** Directions to choose from (the shared direction is already hidden). */
  async listDirections(): Promise<Direction[]> {
    const { data } =
      await api.get<ApiSuccessResponse<Direction[]>>("/directions");
    return data.data;
  },

  /** Skills (shared ones included) and edges of one direction. */
  async getDirectionGraph(directionPublicId: string) {
    const { data } = await api.get<ApiSuccessResponse<DirectionSkillGraph>>(
      `/directions/${directionPublicId}/skills`,
    );
    return data.data;
  },

  // --- ADMIN ---

  /** Same shape as getDirectionGraph; `edges[].publicId` is what deletes an edge. */
  async getAdminDirectionGraph(directionPublicId: string) {
    const { data } = await api.get<ApiSuccessResponse<DirectionSkillGraph>>(
      `/admin/skill-graph/directions/${directionPublicId}`,
    );
    return data.data;
  },

  /** 400 same skill / different directions, 404 unknown skill, 409 exists or cycle. */
  async addPrerequisite(body: CreatePrerequisiteRequest): Promise<SkillEdge> {
    const { data } = await api.post<ApiSuccessResponse<SkillEdge>>(
      "/admin/skill-graph/prerequisites",
      body,
    );
    return data.data;
  },

  /** 204 with no body. */
  async removePrerequisite(edgePublicId: string): Promise<void> {
    await api.delete(`/admin/skill-graph/prerequisites/${edgePublicId}`);
  },
};
