// Shapes of PathWise-BE /api/admin/resources (see PathWise-BE/src/modules/resource).

export const RESOURCE_SLOTS = ["OFFICIAL", "TUTORIAL", "VIDEO_OR_VI"] as const;
export const RESOURCE_TYPES = [
  "VIDEO",
  "ARTICLE",
  "DOC",
  "COURSE",
  "BOOK",
] as const;
export const RESOURCE_LANGUAGES = ["VI", "EN"] as const;

export type ResourceSlot = (typeof RESOURCE_SLOTS)[number];
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type ResourceLanguage = (typeof RESOURCE_LANGUAGES)[number];

export interface Resource {
  publicId: string;
  skillPublicId: string;
  skillSlug: string;
  skillName: string;
  slot: ResourceSlot;
  title: string;
  url: string;
  type: ResourceType;
  language: ResourceLanguage;
  /** 1-5 */
  difficulty: number;
  estimatedMinutes: number;
  description: string | null;
  /** ISO date-time string. */
  updatedAt: string;
}

export interface ResourcePage {
  items: Resource[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ResourceListQuery {
  search?: string;
  slot?: ResourceSlot;
  language?: ResourceLanguage;
  page: number;
  pageSize: number;
}

/** A skill that does not yet have all three resource slots. */
export interface SkillCoverageGap {
  skillPublicId: string;
  skillSlug: string;
  skillName: string;
  missingSlots: ResourceSlot[];
}

export interface ResourceInput {
  slot: ResourceSlot;
  title: string;
  url: string;
  type: ResourceType;
  language: ResourceLanguage;
  difficulty: number;
  estimatedMinutes: number;
  description?: string;
}

export interface CreateResourceRequest extends ResourceInput {
  skillPublicId: string;
}

/** The skill of an existing resource can not be changed. */
export type UpdateResourceRequest = Partial<ResourceInput>;

export const SLOT_LABELS: Record<ResourceSlot, string> = {
  OFFICIAL: "Tài liệu chính thức",
  TUTORIAL: "Hướng dẫn",
  VIDEO_OR_VI: "Video / tiếng Việt",
};

export const TYPE_LABELS: Record<ResourceType, string> = {
  VIDEO: "Video",
  ARTICLE: "Bài viết",
  DOC: "Tài liệu",
  COURSE: "Khóa học",
  BOOK: "Sách",
};
