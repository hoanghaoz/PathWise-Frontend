// Shapes of PathWise-BE skill graph endpoints (/api/directions, /api/admin/skill-graph).

/** FULL = complete graph; PILOT = still being filled in. */
export type DirectionMaturity = "FULL" | "PILOT";

export interface Direction {
  publicId: string;
  name: string;
  slug: string;
  /** Cut off in the API notes we were given; treated as optional text. */
  description?: string | null;
  maturity: DirectionMaturity;
}

export interface Skill {
  publicId: string;
  name: string;
  slug: string;
  /** 1 (easy) to 5 (hard). */
  difficulty: number;
  estimatedHours: number;
  /** Belongs to the shared direction. Only used to label it in pickers. */
  isShared: boolean;
}

/** `skillPublicId` needs `prerequisitePublicId` first (arrow: prerequisite → skill). */
export interface SkillEdge {
  publicId: string;
  skillPublicId: string;
  prerequisitePublicId: string;
}

export interface DirectionSkillGraph {
  direction: Direction;
  /** Includes the shared direction's skills, ordered by id (not learning order). */
  skills: Skill[];
  /** Only edges whose two ends are both in `skills`. */
  edges: SkillEdge[];
}

export interface CreatePrerequisiteRequest {
  skillPublicId: string;
  prerequisitePublicId: string;
}
