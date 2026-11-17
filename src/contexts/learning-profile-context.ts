import { createContext } from "react";

import type { LearningProfile } from "../types/learningProfileTypes";

/**
 * - `idle`: no learner session (guest or admin), nothing to load.
 * - `loading`: GET /learning-profile/me is in flight.
 * - `missing`: 404, the user has not onboarded yet.
 * - `ready`: `profile` is set.
 * - `error`: the request failed for another reason; `error` has the message.
 */
export type LearningProfileStatus =
  "idle" | "loading" | "missing" | "ready" | "error";

export interface LearningProfileContextValue {
  status: LearningProfileStatus;
  profile: LearningProfile | null;
  /** Vietnamese message when `status` is `error`. */
  error: string;
  /** Loads the profile again (after onboarding, or to retry an error). */
  reload: () => Promise<void>;
  /** Stores a profile already returned by the API (PATCH answers with it). */
  setProfile: (profile: LearningProfile) => void;
}

export const LearningProfileContext =
  createContext<LearningProfileContextValue | null>(null);
