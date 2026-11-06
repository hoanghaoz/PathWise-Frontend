import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import SkillGraph from "../../components/graph/SkillGraph";
import PageHead from "../../components/PageHead";
import { SkeletonRows } from "../../components/Skeleton";
import { useToast } from "../../contexts/useToast";
import { useLoad } from "../../hooks/useLoad";
import { usePageTitle } from "../../hooks/usePageTitle";
import { skillGraphService } from "../../services/skillGraphService";
import { toUserMessage } from "../../shared/apiErrorMessages";
import { handleApiError } from "../../shared/handleApiError";
import type { GraphSkill } from "../../shared/skillGraph";
import type { NormalizedApiError } from "../../types/commonTypes";
import type { DirectionSkillGraph } from "../../types/skillGraphTypes";

const CYCLE_PREFIX = "Prerequisites would form a cycle";

/** Text for a failed add/remove of a prerequisite edge. */
const edgeErrorMessage = (error: NormalizedApiError): string => {
  if (error.statusCode === 409) {
    // The backend names the loop with skill slugs: show it as is.
    return error.message.startsWith(CYCLE_PREFIX)
      ? `Quan hệ này tạo vòng lặp: ${error.message.slice(CYCLE_PREFIX.length).replace(/^:\s*/, "")}`
      : "Quan hệ tiên quyết này đã tồn tại.";
  }
  if (error.statusCode === 400) {
    return "Hai kỹ năng phải khác nhau và cùng thuộc một hướng (hoặc hướng chung).";
  }
  if (error.statusCode === 404) {
    return "Không tìm thấy kỹ năng hoặc quan hệ này. Hãy tải lại trang.";
  }
  return toUserMessage(error);
};

const toGraphSkills = (graph: DirectionSkillGraph): GraphSkill[] => {
  const slugOf = new Map(graph.skills.map((s) => [s.publicId, s.slug]));
  return graph.skills.map((skill) => ({
    slug: skill.slug,
    name: skill.name,
    short: skill.name,
    prereqs: graph.edges
      .filter((e) => e.skillPublicId === skill.publicId)
      .map((e) => slugOf.get(e.prerequisitePublicId))
      .filter((slug): slug is string => slug !== undefined),
  }));
};

interface EditorProps {
  graph: DirectionSkillGraph;
  /** Reload the graph after a change. */
  onChanged: () => void;
}

const GraphEditor = ({ graph, onChanged }: EditorProps) => {
  const { showToast } = useToast();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [skillId, setSkillId] = useState("");
  const [prereqId, setPrereqId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const graphSkills = useMemo(() => toGraphSkills(graph), [graph]);
  const subLabels = useMemo(
    () =>
      Object.fromEntries(
        graph.skills.map((s) => [
          s.slug,
          `${s.isShared ? "Chung · " : ""}Độ khó ${s.difficulty}/5`,
        ]),
      ),
    [graph.skills],
  );
  const selected = graph.skills.find((s) => s.slug === selectedSlug) ?? null;
  const nameOf = (id: string) =>
    graph.skills.find((s) => s.publicId === id)?.name ?? id;

  // Edges shown in the side panel: the selected skill's, or all of them.
  const visibleEdges = selected
    ? graph.edges.filter(
        (e) =>
          e.skillPublicId === selected.publicId ||
          e.prerequisitePublicId === selected.publicId,
      )
    : graph.edges;

  const select = (slug: string) => {
    const next = slug === selectedSlug ? null : slug;
    setSelectedSlug(next);
    const skill = graph.skills.find((s) => s.slug === next);
    setSkillId(skill?.publicId ?? "");
    setError("");
  };

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(edgeErrorMessage(handleApiError(e)));
      setBusy(false);
      return;
    }
    setBusy(false);
    setPrereqId("");
    showToast(done);
    onChanged();
  };

  const onAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!skillId || !prereqId) {
      setError("Chọn cả kỹ năng và kỹ năng tiên quyết.");
      return;
    }
    if (skillId === prereqId) {
      setError("Một kỹ năng không thể là tiên quyết của chính nó.");
      return;
    }
    void run(
      () =>
        skillGraphService.addPrerequisite({
          skillPublicId: skillId,
          prerequisitePublicId: prereqId,
        }),
      "Đã thêm quan hệ tiên quyết.",
    );
  };

  const options = graph.skills.map((s) => (
    <option key={s.publicId} value={s.publicId}>
      {s.name}
      {s.isShared ? " (chung)" : ""}
    </option>
  ));

  return (
    <div className="split has-panel">
      <div className="graph-wrap adm-canvas">
        {graph.skills.length === 0 ? (
          <p className="muted card-pad">Hướng này chưa có kỹ năng nào.</p>
        ) : (
          <SkillGraph
            id="adm"
            skills={graphSkills}
            subLabels={subLabels}
            naturalSize
            selected={selectedSlug}
            onSelect={select}
            label={`Skill graph của hướng ${graph.direction.name}. Chọn một kỹ năng để xem quan hệ của nó.`}
          />
        )}
      </div>

      <aside className="panel card-raised" aria-label="Quan hệ tiên quyết">
        <div className="od-stack">
          <h2 className="h3">
            {selected ? selected.name : "Quan hệ tiên quyết"}
          </h2>
          <p className="muted small">
            {selected
              ? `${selected.isShared ? "Kiến thức chung · " : ""}Độ khó ${selected.difficulty}/5 · khoảng ${selected.estimatedHours} giờ. Chọn lại kỹ năng này để bỏ chọn.`
              : "Chọn một kỹ năng trên graph để xem và sửa quan hệ của nó."}
          </p>
        </div>

        <form className="form-stack" noValidate onSubmit={onAdd}>
          {error && (
            <div className="alert alert-danger" role="alert">
              <div>{error}</div>
            </div>
          )}
          <div className="field">
            <label htmlFor="edge-skill">Kỹ năng</label>
            <select
              id="edge-skill"
              className="select"
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
            >
              <option value="">Chọn kỹ năng…</option>
              {options}
            </select>
          </div>
          <div className="field">
            <label htmlFor="edge-prereq">Cần học trước</label>
            <select
              id="edge-prereq"
              className="select"
              value={prereqId}
              onChange={(e) => setPrereqId(e.target.value)}
            >
              <option value="">Chọn kỹ năng tiên quyết…</option>
              {options}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Thêm quan hệ
          </button>
        </form>

        <div>
          <h3 className="small strong">
            {selected ? "Quan hệ của kỹ năng này" : "Tất cả quan hệ"} (
            {visibleEdges.length})
          </h3>
          {visibleEdges.length === 0 ? (
            <p className="muted small">Chưa có quan hệ nào.</p>
          ) : (
            <ul className="list-reset">
              {visibleEdges.map((edge) => (
                <li key={edge.publicId} className="edge-row">
                  <span className="od-fill">
                    <strong>{nameOf(edge.skillPublicId)}</strong>{" "}
                    <span className="arrow" aria-hidden="true">
                      ←
                    </span>
                    <span className="sr-only">cần học trước</span>{" "}
                    {nameOf(edge.prerequisitePublicId)}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={busy}
                    aria-label={`Xóa: ${nameOf(edge.skillPublicId)} cần học ${nameOf(edge.prerequisitePublicId)} trước`}
                    onClick={() =>
                      void run(
                        () =>
                          skillGraphService.removePrerequisite(edge.publicId),
                        "Đã xóa quan hệ tiên quyết.",
                      )
                    }
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};

/** Admin skill graph: GET direction graph, POST/DELETE prerequisite edges. */
const AdminGraphPage = () => {
  usePageTitle("Skill graph");
  const directions = useLoad("directions", skillGraphService.listDirections);
  const [chosen, setChosen] = useState("");
  const selectedId = chosen || directions.data?.[0]?.publicId || null;
  const graph = useLoad(selectedId, () =>
    skillGraphService.getAdminDirectionGraph(selectedId ?? ""),
  );

  const failed = directions.status === "error" ? directions : graph;

  return (
    <div className="page page-wide">
      <PageHead
        eyebrow="Quản trị"
        title="Skill graph"
        lead="Xem và sửa quan hệ tiên quyết giữa các kỹ năng của từng hướng học."
      />
      {directions.status === "ready" && directions.data && (
        <div className="field" style={{ maxWidth: 360 }}>
          <label htmlFor="adm-direction">Hướng học</label>
          <select
            id="adm-direction"
            className="select"
            value={selectedId ?? ""}
            onChange={(e) => setChosen(e.target.value)}
          >
            {directions.data.map((d) => (
              <option key={d.publicId} value={d.publicId}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {(directions.status === "loading" ||
        (graph.status === "loading" && !graph.data)) && (
        <SkeletonRows rows={4} label="Đang tải skill graph" />
      )}
      {(directions.status === "error" || graph.status === "error") && (
        <div className="alert alert-danger" role="alert">
          <div className="alert-body">
            <span className="alert-title">Không tải được dữ liệu</span>
            <p>{failed.error}</p>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={failed.retry}
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
      {graph.data && (
        <GraphEditor
          key={graph.data.direction.publicId}
          graph={graph.data}
          onChanged={graph.retry}
        />
      )}
    </div>
  );
};

export default AdminGraphPage;
