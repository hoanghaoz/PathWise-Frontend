import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { learningProfileService } from "../services/learningProfileService";
import { toUserMessage } from "../shared/apiErrorMessages";
import { handleApiError } from "../shared/handleApiError";
import type { LearningProfile } from "../types/learningProfileTypes";
import { LearningProfileContext } from "./learning-profile-context";
import type { LearningProfileStatus } from "./learning-profile-context";
import { useAuth } from "./useAuth";

/** Result of a load, tagged with the user it belongs to. */
interface Loaded {
  userId: string;
  status: "missing" | "ready" | "error";
  profile: LearningProfile | null;
  error: string;
}

/**
 * Holds the learner's profile (GET /learning-profile/me). Admins have none,
 * so nothing is loaded for them. Results are tagged with the user id, so
 * logging in as someone else never shows the previous user's profile.
 */
const LearningProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.role === "USER" ? user.publicId : null;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  // Only the latest request may write its result.
  const latest = useRef(0);

  const load = useCallback(async (forUser: string) => {
    const request = ++latest.current;
    let next: Loaded;
    try {
      const profile = await learningProfileService.getMine();
      next = { userId: forUser, status: "ready", profile, error: "" };
    } catch (e) {
      const apiError = handleApiError(e);
      next =
        apiError.statusCode === 404
          ? { userId: forUser, status: "missing", profile: null, error: "" }
          : {
              userId: forUser,
              status: "error",
              profile: null,
              error: toUserMessage(apiError),
            };
    }
    if (request === latest.current) setLoaded(next);
  }, []);

  useEffect(() => {
    if (userId) void load(userId);
  }, [userId, load]);

  const reload = useCallback(async () => {
    if (userId) await load(userId);
  }, [userId, load]);

  const setProfile = useCallback(
    (profile: LearningProfile) => {
      if (!userId) return;
      latest.current++; // drop any load still in flight
      setLoaded({ userId, status: "ready", profile, error: "" });
    },
    [userId],
  );

  const value = useMemo(() => {
    const current = loaded && loaded.userId === userId ? loaded : null;
    const status: LearningProfileStatus =
      userId === null ? "idle" : (current?.status ?? "loading");
    return {
      status,
      profile: current?.profile ?? null,
      error: current?.error ?? "",
      reload,
      setProfile,
    };
  }, [loaded, userId, reload, setProfile]);

  return (
    <LearningProfileContext.Provider value={value}>
      {children}
    </LearningProfileContext.Provider>
  );
};

export default LearningProfileProvider;
