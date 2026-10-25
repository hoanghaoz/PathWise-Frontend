import type { ReactNode } from "react";

import Icon from "./Icon";
import type { IconName } from "./Icon";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  text: string;
  actions?: ReactNode;
}

const EmptyState = ({ icon, title, text, actions }: EmptyStateProps) => (
  <div className="card empty">
    <Icon name={icon} className="icon-lg" />
    <h2 className="h3">{title}</h2>
    <p>{text}</p>
    {actions && (
      <div className="od-cluster" style={{ justifyContent: "center" }}>
        {actions}
      </div>
    )}
  </div>
);

export default EmptyState;
