import { useState } from "react";
import type { FormEvent } from "react";

import FormField from "../../components/form/FormField";
import Modal from "../../components/Modal";
import { resourceService } from "../../services/resourceService";
import { handleApiError } from "../../shared/handleApiError";
import {
  RESOURCE_LANGUAGES,
  RESOURCE_SLOTS,
  RESOURCE_TYPES,
  SLOT_LABELS,
  TYPE_LABELS,
} from "../../types/resourceTypes";
import type {
  Resource,
  ResourceLanguage,
  ResourceSlot,
  ResourceType,
  SkillCoverageGap,
} from "../../types/resourceTypes";

interface ResourceFormModalProps {
  /** Resource being edited, or undefined to create one. */
  resource?: Resource;
  /** Skills with a free slot; the "create" form picks its skill from here. */
  gaps: SkillCoverageGap[];
  /** When creating from a gap row, the skill and slot to start with. */
  preset?: { skillPublicId: string; slot: ResourceSlot };
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface FormValues {
  skillPublicId: string;
  slot: ResourceSlot;
  title: string;
  url: string;
  type: ResourceType;
  language: ResourceLanguage;
  difficulty: string;
  estimatedMinutes: string;
  description: string;
}

type Errors = Partial<Record<keyof FormValues, string>>;

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const validate = (values: FormValues, creating: boolean): Errors => {
  const errors: Errors = {};
  if (creating && !values.skillPublicId) errors.skillPublicId = "Chọn kỹ năng.";
  if (!values.title.trim()) errors.title = "Nhập tiêu đề tài liệu.";
  if (!isHttpUrl(values.url.trim()))
    errors.url = "Đường dẫn phải bắt đầu bằng http:// hoặc https://.";
  const difficulty = Number(values.difficulty);
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5)
    errors.difficulty = "Độ khó là số nguyên từ 1 đến 5.";
  const minutes = Number(values.estimatedMinutes);
  if (!Number.isInteger(minutes) || minutes < 1)
    errors.estimatedMinutes = "Thời gian là số phút nguyên, tối thiểu 1.";
  return errors;
};

const ResourceFormModal = ({
  resource,
  gaps,
  preset,
  onClose,
  onSaved,
}: ResourceFormModalProps) => {
  const creating = !resource;
  const [values, setValues] = useState<FormValues>({
    skillPublicId: resource?.skillPublicId ?? preset?.skillPublicId ?? "",
    slot: resource?.slot ?? preset?.slot ?? "OFFICIAL",
    title: resource?.title ?? "",
    url: resource?.url ?? "",
    type: resource?.type ?? "ARTICLE",
    language: resource?.language ?? "EN",
    difficulty: String(resource?.difficulty ?? 1),
    estimatedMinutes: String(resource?.estimatedMinutes ?? 30),
    description: resource?.description ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const set =
    <K extends keyof FormValues>(name: K) =>
    (event: { target: { value: string } }) => {
      setValues((prev) => ({ ...prev, [name]: event.target.value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values, creating);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body = {
      slot: values.slot,
      title: values.title.trim(),
      url: values.url.trim(),
      type: values.type,
      language: values.language,
      difficulty: Number(values.difficulty),
      estimatedMinutes: Number(values.estimatedMinutes),
      ...(values.description.trim() && {
        description: values.description.trim(),
      }),
    };

    setSaving(true);
    setFormError("");
    try {
      if (resource) {
        await resourceService.update(resource.publicId, body);
        onSaved("Đã cập nhật tài liệu.");
      } else {
        await resourceService.create({
          skillPublicId: values.skillPublicId,
          ...body,
        });
        onSaved("Đã thêm tài liệu.");
      }
    } catch (error) {
      const failure = handleApiError(error);
      if (failure.statusCode === 409) {
        setErrors({ slot: "Kỹ năng này đã có tài liệu ở ô này." });
      } else if (Object.keys(failure.fieldErrors).length > 0) {
        setErrors(failure.fieldErrors as Errors);
      } else {
        setFormError(failure.message);
      }
      setSaving(false);
    }
  };

  return (
    <Modal
      wide
      title={creating ? "Thêm tài liệu" : "Sửa tài liệu"}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="resource-form"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "Đang lưu…" : "Lưu tài liệu"}
          </button>
        </>
      }
    >
      <form
        id="resource-form"
        className="od-stack"
        onSubmit={onSubmit}
        noValidate
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        {creating ? (
          <div className="field">
            <label htmlFor="rs-skill">
              Kỹ năng<span className="req">*</span>
            </label>
            <select
              id="rs-skill"
              className="select"
              value={values.skillPublicId}
              onChange={set("skillPublicId")}
              aria-invalid={errors.skillPublicId ? "true" : "false"}
            >
              <option value="">— Chọn kỹ năng còn thiếu tài liệu —</option>
              {gaps.map((gap) => (
                <option key={gap.skillPublicId} value={gap.skillPublicId}>
                  {gap.skillName} ({gap.skillSlug})
                </option>
              ))}
            </select>
            <p className="error-text" hidden={!errors.skillPublicId}>
              {errors.skillPublicId}
            </p>
          </div>
        ) : (
          <p className="muted">
            Kỹ năng: <strong>{resource.skillName}</strong>{" "}
            <span className="mono tiny">{resource.skillSlug}</span>
          </p>
        )}

        <div className="field">
          <label htmlFor="rs-slot">Ô tài liệu</label>
          <select
            id="rs-slot"
            className="select"
            value={values.slot}
            onChange={set("slot")}
            aria-invalid={errors.slot ? "true" : "false"}
          >
            {RESOURCE_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {SLOT_LABELS[slot]}
              </option>
            ))}
          </select>
          <p className="error-text" hidden={!errors.slot}>
            {errors.slot}
          </p>
        </div>

        <FormField
          id="rs-title"
          name="title"
          label="Tiêu đề"
          value={values.title}
          onChange={set("title")}
          error={errors.title}
          required
        />
        <FormField
          id="rs-url"
          name="url"
          label="Đường dẫn (URL)"
          value={values.url}
          onChange={set("url")}
          error={errors.url}
          help="Dán URL thật của tài liệu, không dán nhãn hiển thị."
          required
        />

        <div className="od-row-wrap">
          <div className="field">
            <label htmlFor="rs-type">Loại</label>
            <select
              id="rs-type"
              className="select"
              value={values.type}
              onChange={set("type")}
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rs-language">Ngôn ngữ</label>
            <select
              id="rs-language"
              className="select"
              value={values.language}
              onChange={set("language")}
            >
              {RESOURCE_LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language === "VI" ? "Tiếng Việt" : "English"}
                </option>
              ))}
            </select>
          </div>
          <FormField
            id="rs-difficulty"
            name="difficulty"
            label="Độ khó (1–5)"
            value={values.difficulty}
            onChange={set("difficulty")}
            error={errors.difficulty}
            inputMode="numeric"
            required
          />
          <FormField
            id="rs-minutes"
            name="estimatedMinutes"
            label="Thời gian (phút)"
            value={values.estimatedMinutes}
            onChange={set("estimatedMinutes")}
            error={errors.estimatedMinutes}
            inputMode="numeric"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="rs-desc">Mô tả</label>
          <textarea
            id="rs-desc"
            className="textarea"
            value={values.description}
            onChange={set("description")}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ResourceFormModal;
