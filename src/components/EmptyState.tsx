import type { ReactNode } from "react";

import Icon from "./Icon";
import type { IconName } from "./Icon";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  text: string;
  actions?: ReactNode;
  /** Greyed-out outline of what the screen will show, for upcoming screens. */
  preview?: boolean;
}

const EmptyState = ({
  icon,
  title,
  text,
  actions,
  preview = false,
}: EmptyStateProps) => (
  <div className="card empty">
    <span className="empty-tile">
      <Icon name={icon} className="icon-lg" />
    </span>
    <h2 className="h3">{title}</h2>
    <p>{text}</p>
    {preview && (
      <div className="empty-preview" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    )}
    {actions && (
      <div className="od-cluster" style={{ justifyContent: "center" }}>
        {actions}
      </div>
    )}
  </div>
);

export default EmptyState;
