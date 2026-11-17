import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";

import EmptyState from "../../components/EmptyState";
import Icon from "../../components/Icon";
import Modal from "../../components/Modal";
import PageHead from "../../components/PageHead";
import { useToast } from "../../contexts/useToast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { resourceService } from "../../services/resourceService";
import { handleApiError } from "../../shared/handleApiError";
import {
  RESOURCE_SLOTS,
  SLOT_LABELS,
  TYPE_LABELS,
} from "../../types/resourceTypes";
import type {
  Resource,
  ResourcePage,
  ResourceSlot,
  SkillCoverageGap,
} from "../../types/resourceTypes";
import ResourceFormModal from "./ResourceFormModal";

const PAGE_SIZE = 20;

type Dialog =
  | {
      kind: "form";
      resource?: Resource;
      preset?: { skillPublicId: string; slot: ResourceSlot };
    }
  | { kind: "delete"; resource: Resource };

/**
 * Admin table of learning resources (Sprint 3 / Resource): filter, page,
 * add, edit and delete, plus a warning for skills that still lack one of the
 * three resource slots.
 */
const AdminContentPage = () => {
  usePageTitle("Tài liệu");
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [slot, setSlot] = useState<ResourceSlot | "">("");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [deleting, setDeleting] = useState(false);
  // Bumped after every write so the table and the warning reload.
  const [version, setVersion] = useState(0);
  // The last finished load, tagged with the query it answered. The page is
  // "loading" whenever the current query differs from it.
  const [loaded, setLoaded] = useState<{
    key: string;
    data: ResourcePage | null;
    gaps: SkillCoverageGap[];
    error: string;
  } | null>(null);

  const queryKey = `${search}|${slot}|${page}|${version}`;
  const loading = loaded?.key !== queryKey;
  const data = loaded?.data ?? null;
  const gaps = loaded?.gaps ?? [];
  const loadError = loaded?.error ?? "";

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      resourceService.list({
        search: search.trim() || undefined,
        slot: slot || undefined,
        page,
        pageSize: PAGE_SIZE,
      }),
      resourceService.coverageGaps(),
    ])
      .then(([list, coverage]) => {
        if (!cancelled)
          setLoaded({ key: queryKey, data: list, gaps: coverage, error: "" });
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setLoaded((prev) => ({
            key: queryKey,
            data: prev?.data ?? null,
            gaps: prev?.gaps ?? [],
            error: handleApiError(error).message,
          }));
      });
    return () => {
      cancelled = true;
    };
  }, [search, slot, page, version, queryKey]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const field = new FormData(event.currentTarget).get("search");
    setPage(1);
    setSearch(typeof field === "string" ? field : "");
  };

  const onSaved = (message: string) => {
    setDialog(null);
    showToast(message);
    reload();
  };

  const confirmDelete = async (resource: Resource) => {
    setDeleting(true);
    try {
      await resourceService.remove(resource.publicId);
      setDialog(null);
      showToast("Đã xóa tài liệu.");
      reload();
    } catch (error) {
      const failure = handleApiError(error);
      showToast(
        failure.statusCode === 409
          ? "Tài liệu đang nằm trong một lộ trình nên không thể xóa."
          : failure.message,
        "warn",
      );
      setDialog(null);
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="page page-wide">
      <PageHead
        eyebrow="Quản trị"
        title="Tài liệu"
        lead="Mỗi kỹ năng cần đủ ba ô tài liệu: chính thức, hướng dẫn và video hoặc tiếng Việt."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setDialog({ kind: "form" })}
            disabled={gaps.length === 0}
            title={
              gaps.length === 0
                ? "Mọi ô tài liệu đã đầy; hãy sửa tài liệu có sẵn."
                : undefined
            }
          >
            Thêm tài liệu
          </button>
        }
      />

      {gaps.length > 0 ? (
        <div className="alert alert-warn" role="status">
          <Icon name="alert" />
          <div className="alert-body">
            <span className="alert-title">
              {gaps.length} kỹ năng còn thiếu ô tài liệu
            </span>
            <ul className="err-list">
              {gaps.slice(0, 8).map((gap) => (
                <li key={gap.skillPublicId}>
                  <strong>{gap.skillName}</strong> thiếu{" "}
                  {gap.missingSlots.map((s, i) => (
                    <span key={s}>
                      {i > 0 && ", "}
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() =>
                          setDialog({
                            kind: "form",
                            preset: {
                              skillPublicId: gap.skillPublicId,
                              slot: s,
                            },
                          })
                        }
                      >
                        {SLOT_LABELS[s]}
                      </button>
                    </span>
                  ))}
                </li>
              ))}
              {gaps.length > 8 && <li>… và {gaps.length - 8} kỹ năng khác.</li>}
            </ul>
          </div>
        </div>
      ) : (
        data && (
          <div className="alert alert-ok" role="status">
            <Icon name="check" />
            <div>Mọi kỹ năng đều đủ ba ô tài liệu.</div>
          </div>
        )
      )}

      <form className="toolbar" onSubmit={onSearch} role="search">
        <div className="field grow">
          <label htmlFor="rs-search">Tìm theo tiêu đề hoặc kỹ năng</label>
          <input
            id="rs-search"
            name="search"
            className="input"
            defaultValue={search}
            placeholder="Ví dụ: git, docker, REST…"
          />
        </div>
        <div className="field">
          <label htmlFor="rs-filter-slot">Ô tài liệu</label>
          <select
            id="rs-filter-slot"
            className="select"
            value={slot}
            onChange={(e) => {
              setPage(1);
              setSlot(e.target.value as ResourceSlot | "");
            }}
          >
            <option value="">Tất cả</option>
            {RESOURCE_SLOTS.map((s) => (
              <option key={s} value={s}>
                {SLOT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary">
          Tìm
        </button>
      </form>

      {loadError && (
        <div className="alert alert-danger" role="alert">
          <Icon name="alert" />
          <div>{loadError}</div>
        </div>
      )}

      {loading && !data ? (
        <p className="od-row muted" role="status">
          <span className="spinner" aria-hidden="true" />
          Đang tải tài liệu…
        </p>
      ) : data && data.items.length === 0 ? (
        <EmptyState
          icon="layers"
          title="Không có tài liệu phù hợp"
          text="Thử bỏ bộ lọc hoặc tìm bằng từ khóa khác."
        />
      ) : (
        data && (
          <>
            <div className="table-wrap" aria-busy={loading}>
              <table className="table">
                <caption className="sr-only">Danh sách tài liệu</caption>
                <thead>
                  <tr>
                    <th scope="col">Kỹ năng</th>
                    <th scope="col">Ô</th>
                    <th scope="col">Tiêu đề</th>
                    <th scope="col">Loại</th>
                    <th scope="col">Ngôn ngữ</th>
                    <th scope="col">Độ khó</th>
                    <th scope="col">Phút</th>
                    <th scope="col">
                      <span className="sr-only">Thao tác</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.publicId}>
                      <td>
                        <strong>{item.skillName}</strong>
                        <br />
                        <span className="mono tiny">{item.skillSlug}</span>
                      </td>
                      <td>
                        <span className="chip chip-info">
                          {SLOT_LABELS[item.slot]}
                        </span>
                      </td>
                      <td className="cell-title">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          {item.title}
                        </a>
                      </td>
                      <td>{TYPE_LABELS[item.type]}</td>
                      <td>{item.language}</td>
                      <td className="num">{item.difficulty}</td>
                      <td className="num">{item.estimatedMinutes}</td>
                      <td>
                        <div className="od-cluster">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() =>
                              setDialog({ kind: "form", resource: item })
                            }
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              setDialog({ kind: "delete", resource: item })
                            }
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav className="od-cluster" aria-label="Phân trang">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page <= 1}
              >
                <Icon name="arrowL" className="icon-sm" />
                Trước
              </button>
              <span className="muted" aria-live="polite">
                Trang {page}/{totalPages} · {data.total} tài liệu
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages}
              >
                Sau
                <Icon name="arrowR" className="icon-sm" />
              </button>
            </nav>
          </>
        )
      )}

      {dialog?.kind === "form" && (
        <ResourceFormModal
          resource={dialog.resource}
          preset={dialog.preset}
          gaps={gaps}
          onClose={() => setDialog(null)}
          onSaved={onSaved}
        />
      )}
      {dialog?.kind === "delete" && (
        <Modal
          alert
          title="Xóa tài liệu này?"
          onClose={() => setDialog(null)}
          footer={
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDialog(null)}
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger-solid"
                onClick={() => void confirmDelete(dialog.resource)}
                disabled={deleting}
              >
                {deleting ? "Đang xóa…" : "Xóa tài liệu"}
              </button>
            </>
          }
        >
          <p>
            <strong>{dialog.resource.title}</strong> của kỹ năng{" "}
            {dialog.resource.skillName} sẽ bị xóa. Kỹ năng này sẽ thiếu ô{" "}
            {SLOT_LABELS[dialog.resource.slot]} cho đến khi bạn thêm lại.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default AdminContentPage;
