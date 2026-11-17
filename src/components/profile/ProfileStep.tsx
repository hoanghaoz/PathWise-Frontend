import type { ReactNode } from "react";

import { cx } from "../../shared/cx";

interface ProfileStepProps {
  /** Unique id; the heading is `${id}-h` (the pickers use it as their label). */
  id: string;
  title: string;
  lead?: string;
  /** Step number for onboarding, which really is a sequence. */
  number?: number;
  /** Draw the step as a raised card (onboarding) instead of plain flow. */
  raised?: boolean;
  children: ReactNode;
}

/** One section of the learning profile form: heading, short lead, content. */
const ProfileStep = ({
  id,
  title,
  lead,
  number,
  raised = false,
  children,
}: ProfileStepProps) => (
  <section
    className={cx("ob-step", raised && "card-raised card-pad")}
    aria-labelledby={`${id}-h`}
  >
    <div className="ob-step-head">
      {number !== undefined && (
        <span className="ob-n" aria-hidden="true">
          {number}
        </span>
      )}
      <div>
        <h2 id={`${id}-h`}>{title}</h2>
        {lead && <p>{lead}</p>}
      </div>
    </div>
    {children}
  </section>
);

export default ProfileStep;
