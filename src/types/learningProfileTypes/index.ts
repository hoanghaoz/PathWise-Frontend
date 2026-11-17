// Shapes of PathWise-BE /api/learning-profile endpoints.
import type { Direction, Skill } from "../skillGraphTypes";

export interface LearningProfile {
  publicId: string;
  /** YYYY-MM-DD. */
  deadline: string;
  hoursPerWeek: number;
  direction: Direction;
  /** Ordered by id (oldest first), not by learning order. */
  targetSkills: Skill[];
  selfDeclaredSkills: Skill[];
}

export interface CreateLearningProfileRequest {
  deadline: string;
  /** Integer 1-60. */
  hoursPerWeek: number;
  directionPublicId: string;
  /** At least one, no duplicates. */
  targetSkillPublicIds: string[];
  /** The field is required, but the list may be empty. */
  selfDeclaredSkillPublicIds: string[];
}

/**
 * Send only what changed (at least one field). Both skill lists replace the
 * old list. Changing `directionPublicId` requires `targetSkillPublicIds`.
 */
export type UpdateLearningProfileRequest =
  Partial<CreateLearningProfileRequest>;
