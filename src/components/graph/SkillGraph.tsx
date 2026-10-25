import { useMemo } from "react";

import {
  NODE_H,
  NODE_W,
  STATUS_LABEL,
  layoutGraph,
} from "../../shared/skillGraph";
import type { GraphSkill, NodeResult } from "../../shared/skillGraph";

interface SkillGraphProps {
  /** Unique per page: used for the SVG marker ids. */
  id: string;
  skills: GraphSkill[];
  /** Assessment result per skill slug; missing = not assessed yet. */
  results?: Record<string, NodeResult>;
  /** Target skills get a thick border and a ring icon. */
  targets?: Set<string>;
  vertical?: boolean;
  /** Accessible name of the whole graph. */
  label: string;
}

/** Left padding of the labels inside a node (and right margin of the clip). */
const TEXT_PAD = 12;

const subLabel = (result: NodeResult | undefined) => {
  if (!result) return "Chưa đánh giá";
  return (
    STATUS_LABEL[result.status] +
    (result.source === "INFERRED" ? " · suy luận" : "")
  );
};

/** Read-only skill graph (SVG), same geometry and classes as the design. */
const SkillGraph = ({
  id,
  skills,
  results = {},
  targets = new Set(),
  vertical = false,
  label,
}: SkillGraphProps) => {
  const layout = useMemo(
    () => layoutGraph(skills, vertical),
    [skills, vertical],
  );

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="list"
      aria-label={label}
    >
      <defs>
        <marker
          id={`${id}-a`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 10 5 0 10z" fill="#B8C0CC" />
        </marker>
        {/* Keeps long skill names inside the node (userSpaceOnUse = each
            node's own translated coordinates). */}
        <clipPath id={`${id}-clip`} clipPathUnits="userSpaceOnUse">
          <rect x="0" y="0" width={NODE_W - TEXT_PAD} height={NODE_H} />
        </clipPath>
      </defs>
      <g>
        {layout.edges.map((edge) => (
          <path
            key={`${edge.from}->${edge.to}`}
            className="g-edge"
            d={edge.d}
            markerEnd={`url(#${id}-a)`}
          />
        ))}
      </g>
      <g>
        {skills.map((skill) => {
          const p = layout.pos[skill.slug];
          const result = results[skill.slug];
          const isTarget = targets.has(skill.slug);
          const classes = ["g-node"];
          if (result) {
            classes.push(`st-${result.status}`);
            if (result.source === "INFERRED") classes.push("src-INFERRED");
          }
          if (isTarget) classes.push("target");
          const sub = subLabel(result);
          return (
            <g
              key={skill.slug}
              className={classes.join(" ")}
              transform={`translate(${p.x} ${p.y})`}
              role="listitem"
              aria-label={`${skill.name}. ${sub}${isTarget ? ". Kỹ năng mục tiêu" : ""}`}
            >
              <title>{skill.name}</title>
              <rect width={NODE_W} height={NODE_H} rx="8" />
              <text x={TEXT_PAD} y="23" clipPath={`url(#${id}-clip)`}>
                {skill.short}
              </text>
              <text className="g-sub" x={TEXT_PAD} y="41">
                {sub}
              </text>
              {/* Target ring sits on the shorter status line, not next to the
                  name, so a long name like "Authorization & RBAC" never
                  runs into it. */}
              {isTarget && (
                <g
                  transform={`translate(${NODE_W - 16} 37)`}
                  aria-hidden="true"
                >
                  <circle
                    r="5.5"
                    fill="none"
                    stroke="#111827"
                    strokeWidth="1.5"
                  />
                  <circle r="1.8" fill="#111827" />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default SkillGraph;
