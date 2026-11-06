import { useState } from "react";

import FormAlert from "../../components/form/FormAlert";
import SubmitButton from "../../components/form/SubmitButton";
import ProfileFields from "../../components/profile/ProfileFields";
import { SkeletonRows } from "../../components/Skeleton";
import { useLearningProfile } from "../../contexts/useLearningProfile";
import { useToast } from "../../contexts/useToast";
import { useForm } from "../../hooks/useForm";
import { useLoad } from "../../hooks/useLoad";
import { sameIds, useProfileSelection } from "../../hooks/useProfileSelection";
import { learningProfileService } from "../../services/learningProfileService";
import { skillGraphService } from "../../services/skillGraphService";
import { handleApiError } from "../../shared/handleApiError";
import { profileErrorMessage } from "../../shared/profileErrors";
import { deadline, hoursPerWeek } from "../../shared/validators";
import type {
  LearningProfile,
  UpdateLearningProfileRequest,
} from "../../types/learningProfileTypes";
import type { Direction, Skill } from "../../types/skillGraphTypes";

interface EditFormProps {
  profile: LearningProfile;
  directions: Direction[];
  /** Called after a successful save, or when the user cancels. */
  onDone: () => void;
}

/** Sends only the fields that differ from the saved profile (PATCH). */
const EditForm = ({ profile, directions, onDone }: EditFormProps) => {
  const { setProfile } = useLearningProfile();
  const { showToast } = useToast();
  const selection = useProfileSelection({
    directionId: profile.direction.publicId,
    targetIds: profile.targetSkills.map((s) => s.publicId),
    knownIds: profile.selfDeclaredSkills.map((s) => s.publicId),
  });
  const form = useForm({
    idPrefix: "lp",
    initial: {
      deadline: profile.deadline,
      hoursPerWeek: String(profile.hoursPerWeek),
    },
    rules: { deadline, hoursPerWeek },
  });
  const [pickErrors, setPickErrors] = useState<{
    direction?: string;
    targets?: string;
    known?: string;
  }>({});

  const onSubmit = form.handleSubmit(async (values) => {
    const body: UpdateLearningProfileRequest = {};
    if (values.deadline.trim() !== profile.deadline) {
      body.deadline = values.deadline.trim();
    }
    if (Number(values.hoursPerWeek) !== profile.hoursPerWeek) {
      body.hoursPerWeek = Number(values.hoursPerWeek);
    }
    const directionChanged =
      selection.directionId !== profile.direction.publicId;
    if (directionChanged) body.directionPublicId = selection.directionId;
    const savedTargets = profile.targetSkills.map((s) => s.publicId);
    if (directionChanged || !sameIds(selection.targetIds, savedTargets)) {
      body.targetSkillPublicIds = selection.targetIds;
    }
    const savedKnown = profile.selfDeclaredSkills.map((s) => s.publicId);
    if (!sameIds(selection.knownIds, savedKnown)) {
      body.selfDeclaredSkillPublicIds = selection.knownIds;
    }

    const missing: typeof pickErrors = {};
    if (body.targetSkillPublicIds && body.targetSkillPublicIds.length === 0) {
      missing.targets = directionChanged
        ? "Khi đổi hướng học, hãy chọn lại ít nhất một kỹ năng mục tiêu."
        : "Chọn ít nhất một kỹ năng mục tiêu.";
    }
    setPickErrors(missing);
    if (missing.targets) {
      document.getElementById("target-skills")?.focus();
      return;
    }
    if (Object.keys(body).length === 0) {
      form.setFormError("Chưa có thay đổi nào để lưu.");
      return;
    }

    try {
      setProfile(await learningProfileService.updateMine(body));
    } catch (error) {
      const apiError = handleApiError(error);
      form.applyServerErrors(apiError.fieldErrors);
      setPickErrors({
        direction: apiError.fieldErrors.directionPublicId,
        targets: apiError.fieldErrors.targetSkillPublicIds,
        known: apiError.fieldErrors.selfDeclaredSkillPublicIds,
      });
      form.setFormError(profileErrorMessage(apiError));
      return;
    }
    showToast(
      directionChanged || body.targetSkillPublicIds
        ? "Đã lưu hồ sơ học tập. Lộ trình và kết quả đánh giá cũ có thể chưa khớp với thay đổi này."
        : "Đã lưu hồ sơ học tập.",
    );
    onDone();
  });

  return (
    <form className="form-stack" noValidate onSubmit={onSubmit}>
      <FormAlert issues={form.issues} formError={form.formError} />
      <ProfileFields
        deadline={form.field("deadline")}
        hoursPerWeek={form.field("hoursPerWeek")}
        directions={directions}
        selection={selection}
        errors={pickErrors}
      />
      <p className="help">
        Đổi hướng học sẽ xóa lựa chọn kỹ năng mục tiêu và kỹ năng đã biết để bạn
        chọn lại. Lộ trình và kết quả đánh giá đã có không tự cập nhật.
      </p>
      <div className="od-cluster">
        <SubmitButton loading={form.submitting} loadingText="Đang lưu…">
          Lưu thay đổi
        </SubmitButton>
        <button type="button" className="btn btn-ghost" onClick={onDone}>
          Hủy
        </button>
      </div>
    </form>
  );
};

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** "còn 12 ngày", "hôm nay" or "quá hạn 3 ngày", counted in whole days. */
const daysLeftLabel = (iso: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round(
    (new Date(`${iso}T00:00:00`).getTime() - today.getTime()) / 86_400_000,
  );
  if (days === 0) return { text: "Hạn là hôm nay", late: false };
  if (days > 0) return { text: `Còn ${days} ngày`, late: false };
  return { text: `Quá hạn ${-days} ngày`, late: true };
};

const SkillChips = ({ title, skills }: { title: string; skills: Skill[] }) => (
  <div className="od-stack">
    <h3 className="small strong">{title}</h3>
    {skills.length === 0 ? (
      <p className="muted small">Chưa chọn kỹ năng nào.</p>
    ) : (
      <ul className="chip-list list-reset">
        {skills.map((s) => (
          <li key={s.publicId} className="chip chip-outline">
            {s.name}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Summary = ({ profile }: { profile: LearningProfile }) => {
  const left = daysLeftLabel(profile.deadline);
  return (
    <div className="lp-summary">
      <div className="lp-metrics">
        <div className="lp-metric">
          <span className="cap">Hướng học</span>
          <span className="val">{profile.direction.name}</span>
        </div>
        <div className="lp-metric">
          <span className="cap">Hạn hoàn thành</span>
          <span className="val">{formatDate(profile.deadline)}</span>
          <span className="sub">{left.text}</span>
        </div>
        <div className="lp-metric">
          <span className="cap">Thời gian mỗi tuần</span>
          <span className="val">{profile.hoursPerWeek} giờ</span>
        </div>
      </div>
      <SkillChips title="Kỹ năng mục tiêu" skills={profile.targetSkills} />
      <SkillChips title="Kỹ năng đã biết" skills={profile.selfDeclaredSkills} />
    </div>
  );
};

/** "Hồ sơ học tập" card of the profile screen: GET + PATCH /learning-profile/me. */
const LearningProfileSection = () => {
  const { profile } = useLearningProfile();
  const directions = useLoad("directions", skillGraphService.listDirections);
  const [editing, setEditing] = useState(false);

  return (
    <section className="card-raised card-pad" aria-labelledby="lp-h">
      <div className="form-stack">
        <div className="od-cluster" style={{ justifyContent: "space-between" }}>
          <h2 id="lp-h" className="h3">
            Hồ sơ học tập
          </h2>
          {!editing && profile && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setEditing(true)}
            >
              Chỉnh sửa
            </button>
          )}
        </div>
        {profile && !editing && <Summary profile={profile} />}
        {profile && editing && directions.status === "loading" && (
          <SkeletonRows rows={3} label="Đang tải" />
        )}
        {editing && directions.status === "error" && (
          <div className="alert alert-danger" role="alert">
            <div className="alert-body">
              <p>{directions.error}</p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={directions.retry}
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
        {profile &&
          editing &&
          directions.status === "ready" &&
          directions.data && (
            <EditForm
              key={profile.publicId}
              profile={profile}
              directions={directions.data}
              onDone={() => setEditing(false)}
            />
          )}
      </div>
    </section>
  );
};

export default LearningProfileSection;
