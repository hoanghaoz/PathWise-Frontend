import { useState } from "react";
import { useNavigate } from "react-router-dom";

import FormAlert from "../../components/form/FormAlert";
import SubmitButton from "../../components/form/SubmitButton";
import Brand from "../../components/Brand";
import SkipLink from "../../components/layout/SkipLink";
import PageHead from "../../components/PageHead";
import { SkeletonRows } from "../../components/Skeleton";
import ProfileFields from "../../components/profile/ProfileFields";
import { useAuth } from "../../contexts/useAuth";
import { useLearningProfile } from "../../contexts/useLearningProfile";
import { useToast } from "../../contexts/useToast";
import { useForm } from "../../hooks/useForm";
import { useLoad } from "../../hooks/useLoad";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useProfileSelection } from "../../hooks/useProfileSelection";
import { learningProfileService } from "../../services/learningProfileService";
import { handleApiError } from "../../shared/handleApiError";
import { profileErrorMessage } from "../../shared/profileErrors";
import { ROUTES } from "../../shared/routes";
import { deadline, hoursPerWeek } from "../../shared/validators";
import { skillGraphService } from "../../services/skillGraphService";

/**
 * First-run screen: POST /learning-profile. Once the profile is loaded,
 * OnboardingOnly sends the user into the app (this page never navigates on
 * success itself).
 */
const OnboardingPage = () => {
  usePageTitle("Hồ sơ học tập");
  const { logout } = useAuth();
  const { reload } = useLearningProfile();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const directions = useLoad("directions", skillGraphService.listDirections);
  const selection = useProfileSelection({
    directionId: "",
    targetIds: [],
    knownIds: [],
  });
  const form = useForm({
    idPrefix: "ob",
    initial: { deadline: "", hoursPerWeek: "" },
    rules: { deadline, hoursPerWeek },
  });
  const [pickErrors, setPickErrors] = useState<{
    direction?: string;
    targets?: string;
    known?: string;
  }>({});

  const onSubmit = form.handleSubmit(async (values) => {
    const missing: typeof pickErrors = {};
    if (!selection.directionId) missing.direction = "Vui lòng chọn hướng học.";
    else if (selection.targetIds.length === 0) {
      missing.targets = "Chọn ít nhất một kỹ năng mục tiêu.";
    }
    setPickErrors(missing);
    if (missing.direction) {
      document.getElementById("direction-picker")?.focus();
      return;
    }
    if (missing.targets) {
      document.getElementById("target-skills")?.focus();
      return;
    }

    try {
      await learningProfileService.create({
        deadline: values.deadline.trim(),
        hoursPerWeek: Number(values.hoursPerWeek),
        directionPublicId: selection.directionId,
        targetSkillPublicIds: selection.targetIds,
        selfDeclaredSkillPublicIds: selection.knownIds,
      });
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.statusCode === 409) {
        // Already onboarded (e.g. in another tab): just load it.
        await reload();
        return;
      }
      form.applyServerErrors(apiError.fieldErrors);
      setPickErrors({
        direction: apiError.fieldErrors.directionPublicId,
        targets: apiError.fieldErrors.targetSkillPublicIds,
        known: apiError.fieldErrors.selfDeclaredSkillPublicIds,
      });
      form.setFormError(profileErrorMessage(apiError));
      return;
    }
    showToast("Đã lưu hồ sơ học tập.");
    await reload();
  });

  const onLogout = async () => {
    await logout();
    showToast("Đã đăng xuất.");
    navigate(ROUTES.landing);
  };

  return (
    <>
      <SkipLink />
      <div className="auth-wrap">
        <header className="focus-bar">
          <Brand to={ROUTES.onboarding} />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onLogout}
          >
            Đăng xuất
          </button>
        </header>
        <main id="main" tabIndex={-1} className="page page-narrow route-enter">
          <PageHead
            eyebrow="Bắt đầu"
            title="Hồ sơ học tập"
            lead="Cho PathWise biết mục tiêu và thời gian của bạn để lập lộ trình phù hợp."
          />
          {directions.status === "loading" && (
            <SkeletonRows rows={3} label="Đang tải danh sách hướng học" />
          )}
          {directions.status === "error" && (
            <div className="alert alert-danger" role="alert">
              <div className="alert-body">
                <span className="alert-title">Không tải được hướng học</span>
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
          {directions.status === "ready" && directions.data && (
            <form className="ob-form" noValidate onSubmit={onSubmit}>
              <FormAlert issues={form.issues} formError={form.formError} />
              <ProfileFields
                deadline={form.field("deadline")}
                hoursPerWeek={form.field("hoursPerWeek")}
                directions={directions.data}
                selection={selection}
                errors={pickErrors}
                onboarding
              />
              <div className="sticky-bar">
                <p className="tally" aria-live="polite">
                  <strong>{selection.targetIds.length}</strong> kỹ năng mục tiêu
                  · <strong>{selection.knownIds.length}</strong> đã biết
                </p>
                <SubmitButton loading={form.submitting} loadingText="Đang lưu…">
                  Lưu hồ sơ
                </SubmitButton>
              </div>
            </form>
          )}
        </main>
      </div>
    </>
  );
};

export default OnboardingPage;
