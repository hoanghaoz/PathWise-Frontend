import api from "./api";
import type { ApiSuccessResponse } from "../types/commonTypes";
import type {
  CreateResourceRequest,
  Resource,
  ResourceListQuery,
  ResourcePage,
  SkillCoverageGap,
  UpdateResourceRequest,
} from "../types/resourceTypes";

// Thin wrappers over PathWise-BE /api/admin/resources (ADMIN only). Each
// returns the unwrapped `data` of ApiSuccessResponse and throws AxiosError on
// failure (see handleApiError).

export const resourceService = {
  async list(query: ResourceListQuery): Promise<ResourcePage> {
    const { data } = await api.get<ApiSuccessResponse<ResourcePage>>(
      "/admin/resources",
      { params: query },
    );
    return data.data;
  },

  async coverageGaps(): Promise<SkillCoverageGap[]> {
    const { data } = await api.get<ApiSuccessResponse<SkillCoverageGap[]>>(
      "/admin/resources/coverage-gaps",
    );
    return data.data;
  },

  async create(body: CreateResourceRequest): Promise<Resource> {
    const { data } = await api.post<ApiSuccessResponse<Resource>>(
      "/admin/resources",
      body,
    );
    return data.data;
  },

  async update(
    publicId: string,
    body: UpdateResourceRequest,
  ): Promise<Resource> {
    const { data } = await api.patch<ApiSuccessResponse<Resource>>(
      `/admin/resources/${publicId}`,
      body,
    );
    return data.data;
  },

  async remove(publicId: string): Promise<void> {
    await api.delete(`/admin/resources/${publicId}`);
  },
};
