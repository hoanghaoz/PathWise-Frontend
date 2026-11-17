import type { CSSProperties } from "react";

interface SkeletonProps {
  /** CSS width, e.g. "60%" or "8rem". Defaults to the full width. */
  width?: string;
  height?: string;
}

/** Grey placeholder bar while data loads (shimmers unless reduced motion). */
export const Skeleton = ({
  width = "100%",
  height = "1rem",
}: SkeletonProps) => (
  <span
    className="skeleton"
    aria-hidden="true"
    style={{ width, height } as CSSProperties}
  />
);

/** Screen-reader friendly loading block made of `rows` skeleton bars. */
export const SkeletonRows = ({
  rows = 3,
  label,
}: {
  rows?: number;
  label: string;
}) => (
  <div className="od-stack" role="status" aria-label={label}>
    {Array.from({ length: rows }, (_, i) => (
      <Skeleton key={i} height="3.5rem" />
    ))}
  </div>
);
