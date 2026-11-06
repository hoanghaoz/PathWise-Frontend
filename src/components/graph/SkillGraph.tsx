import { useMemo } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

import { cx } from "../../shared/cx";
import {
  NODE_H,
  NODE_W,
  STATUS_LABEL,
  layerMap,
  layoutGraph,
  relatedSlugs,
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
  /**
   * Text under each skill name (by slug). Without it the line shows the
   * assessment status, which is not meaningful outside the result screen.
   */
  subLabels?: Record<string, string>;
  /** Nodes and edges fade in layer by layer once (landing hero). */
  reveal?: boolean;
  /** Draw at the layout's own pixel size (scrolls) instead of scaling to fit. */
  naturalSize?: boolean;
  /** Slug of the selected skill: its neighbourhood stays lit, the rest dims. */
  selected?: string | null;
  /** Makes nodes keyboard-focusable buttons. Called with the clicked slug. */
  onSelect?: (slug: string) => void;
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
  subLabels,
  reveal = false,
  naturalSize = false,
  selected = null,
  onSelect,
  label,
}: SkillGraphProps) => {
  const layout = useMemo(
    () => layoutGraph(skills, vertical),
    [skills, vertical],
  );

  const layers = useMemo(() => layerMap(skills), [skills]);
  const related = useMemo(
    () => (selected ? relatedSlugs(skills, selected) : null),
    [skills, selected],
  );
  const interactive = onSelect !== undefined;

  const onKeyDown = (slug: string) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(slug);
    }
  };

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      width={naturalSize ? layout.width : undefined}
      height={naturalSize ? layout.height : undefined}
      style={naturalSize ? { maxWidth: "none" } : undefined}
      role={interactive ? "group" : "list"}
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
        {layout.edges.map((edge) => {
          const lit =
            selected !== null &&
            related !== null &&
            [edge.from, edge.to].every(
              (slug) => slug === selected || related.has(slug),
            );
          return (
            <path
              key={`${edge.from}->${edge.to}`}
              className={cx(
                "g-edge",
                reveal && "reveal",
                selected !== null && (lit ? "hl" : "dim"),
              )}
              style={{ "--i": layers[edge.from] ?? 0 } as CSSProperties}
              d={edge.d}
              markerEnd={`url(#${id}-a)`}
            />
          );
        })}
      </g>
      <g>
        {skills.map((skill) => {
          const p = layout.pos[skill.slug];
          const result = results[skill.slug];
          const isTarget = targets.has(skill.slug);
          const isSelected = selected === skill.slug;
          const isRelated = related?.has(skill.slug) ?? false;
          const classes = cx(
            "g-node",
            result && `st-${result.status}`,
            result?.source === "INFERRED" && "src-INFERRED",
            isTarget && "target",
            reveal && "reveal",
            interactive && "clickable",
            isSelected && "selected",
            isRelated && "related",
            selected !== null && !isSelected && !isRelated && "dim",
          );
          const sub = subLabels
            ? (subLabels[skill.slug] ?? "")
            : subLabel(result);
          return (
            <g
              key={skill.slug}
              className={classes}
              style={{ "--i": layers[skill.slug] ?? 0 } as CSSProperties}
              transform={`translate(${p.x} ${p.y})`}
              role={interactive ? "button" : "listitem"}
              tabIndex={interactive ? 0 : undefined}
              aria-pressed={interactive ? isSelected : undefined}
              onClick={interactive ? () => onSelect(skill.slug) : undefined}
              onKeyDown={interactive ? onKeyDown(skill.slug) : undefined}
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
