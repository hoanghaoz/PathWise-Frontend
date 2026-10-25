import type { ReactNode } from "react";

interface PageHeadProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
}

const PageHead = ({ eyebrow, title, lead, actions }: PageHeadProps) => (
  <div className="page-head">
    <div className="od-stack">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 id="page-title" tabIndex={-1}>
        {title}
      </h1>
      {lead && <p className="lead">{lead}</p>}
    </div>
    {actions && <div className="od-cluster">{actions}</div>}
  </div>
);

export default PageHead;
