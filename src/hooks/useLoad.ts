import { useEffect, useEffectEvent, useState } from "react";

import { toUserMessage } from "../shared/apiErrorMessages";
import { handleApiError } from "../shared/handleApiError";

export type LoadStatus = "idle" | "loading" | "ready" | "error";

interface Result<T> {
  key: string;
  attempt: number;
  data?: T;
  error?: string;
}

/**
 * Loads data for a screen. Re-runs when `key` changes (e.g. the selected
 * direction id); `key = null` means "nothing to load yet". Errors become a
 * Vietnamese message and `retry()` runs the request again.
 */
export function useLoad<T>(key: string | null, fetcher: () => Promise<T>) {
  const [result, setResult] = useState<Result<T> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const run = useEffectEvent(fetcher);

  useEffect(() => {
    if (key === null) return;
    let cancelled = false;
    run().then(
      (data) => {
        if (!cancelled) setResult({ key, attempt, data });
      },
      (e: unknown) => {
        if (cancelled) return;
        setResult({ key, attempt, error: toUserMessage(handleApiError(e)) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const current = result?.key === key && result.attempt === attempt;
  const status: LoadStatus =
    key === null
      ? "idle"
      : !current
        ? "loading"
        : result.error !== undefined
          ? "error"
          : "ready";

  return {
    status,
    // Kept while reloading the same key, so a screen can refresh in place.
    data: result?.key === key ? result.data : undefined,
    error: current ? (result.error ?? "") : "",
    retry: () => setAttempt((n) => n + 1),
  };
}
