// Layout of a skill graph (DAG) into layers, ported from the design's
// graphSVG(): a node's layer is 1 + the deepest layer of its prerequisites.

export type SkillStatus = "MASTERED" | "PARTIAL" | "NOT_MASTERED";
export type ResultSource = "ANSWERED" | "INFERRED";

export interface GraphSkill {
  slug: string;
  name: string;
  /** Short label drawn inside the node. */
  short: string;
  prereqs: string[];
}

export interface NodeResult {
  status: SkillStatus;
  source: ResultSource;
}

export const STATUS_LABEL: Record<SkillStatus, string> = {
  MASTERED: "Đã nắm",
  PARTIAL: "Nắm một phần",
  NOT_MASTERED: "Chưa nắm",
};

export const NODE_W = 172;
export const NODE_H = 54;
const PAD = 20;

export interface GraphLayout {
  width: number;
  height: number;
  pos: Record<string, { x: number; y: number }>;
  edges: { from: string; to: string; d: string }[];
}

export function layerMap(skills: GraphSkill[]): Record<string, number> {
  const bySlug = new Map(skills.map((s) => [s.slug, s]));
  const memo: Record<string, number> = {};
  const visiting = new Set<string>();
  const layer = (slug: string): number => {
    if (memo[slug] !== undefined) return memo[slug];
    if (visiting.has(slug)) return 0; // defensive: a cycle should never exist
    visiting.add(slug);
    const prereqs = (bySlug.get(slug)?.prereqs ?? []).filter((p) =>
      bySlug.has(p),
    );
    const value = prereqs.length ? Math.max(...prereqs.map(layer)) + 1 : 0;
    visiting.delete(slug);
    memo[slug] = value;
    return value;
  };
  skills.forEach((s) => layer(s.slug));
  return memo;
}

/** Positions nodes layer by layer; `vertical` stacks layers top to bottom. */
export function layoutGraph(
  skills: GraphSkill[],
  vertical: boolean,
): GraphLayout {
  const gapLayer = vertical ? 40 : 52;
  const gapItem = vertical ? 24 : 18;
  const lm = layerMap(skills);
  const cols: Record<number, GraphSkill[]> = {};
  skills.forEach((s) => (cols[lm[s.slug]] ??= []).push(s));
  const layers = Object.keys(cols).map(Number);
  const nL = layers.length ? Math.max(...layers) + 1 : 1;
  const maxN = Math.max(1, ...layers.map((l) => cols[l].length));
  const itemSize = vertical ? NODE_W : NODE_H;
  const span = maxN * itemSize + (maxN - 1) * gapItem;

  const pos: GraphLayout["pos"] = {};
  for (let l = 0; l < nL; l++) {
    const col = cols[l] ?? [];
    const len = col.length * itemSize + (col.length - 1) * gapItem;
    col.forEach((s, i) => {
      const along = PAD + (span - len) / 2 + i * (itemSize + gapItem);
      const across = PAD + l * ((vertical ? NODE_H : NODE_W) + gapLayer);
      pos[s.slug] = vertical
        ? { x: along, y: across }
        : { x: across, y: along };
    });
  }

  const edges: GraphLayout["edges"] = [];
  skills.forEach((s) => {
    s.prereqs.forEach((p) => {
      const a = pos[p];
      const b = pos[s.slug];
      if (!a || !b) return;
      let d: string;
      if (vertical) {
        const x1 = a.x + NODE_W / 2;
        const y1 = a.y + NODE_H;
        const x2 = b.x + NODE_W / 2;
        const y2 = b.y;
        const my = (y2 - y1) / 2;
        d = `M${x1} ${y1} C${x1} ${y1 + my} ${x2} ${y2 - my} ${x2} ${y2 - 2}`;
      } else {
        const x1 = a.x + NODE_W;
        const y1 = a.y + NODE_H / 2;
        const x2 = b.x;
        const y2 = b.y + NODE_H / 2;
        const mx = Math.max(24, (x2 - x1) / 2);
        d = `M${x1} ${y1} C${x1 + mx} ${y1} ${x2 - mx} ${y2} ${x2 - 2} ${y2}`;
      }
      edges.push({ from: p, to: s.slug, d });
    });
  });

  const width = vertical
    ? PAD * 2 + span
    : PAD * 2 + nL * NODE_W + (nL - 1) * gapLayer;
  const height = vertical
    ? PAD * 2 + nL * NODE_H + (nL - 1) * gapLayer
    : PAD * 2 + span;
  return { width, height, pos, edges };
}
