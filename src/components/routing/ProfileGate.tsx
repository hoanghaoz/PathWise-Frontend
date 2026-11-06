import { useLearningProfile } from "../../contexts/useLearningProfile";
import { Skeleton } from "../Skeleton";

/** Shown while the learning profile is being loaded. */
export const ProfileLoading = () => (
  <div className="auth-body" role="status" aria-label="Đang tải hồ sơ học tập">
    <div className="od-stack" style={{ width: "min(420px, 100%)" }}>
      <Skeleton width="40%" height="1.5rem" />
      <Skeleton height="4rem" />
      <Skeleton width="70%" />
    </div>
  </div>
);

/** The profile request failed (not a 404): say so and offer a retry. */
export const ProfileLoadError = () => {
  const { error, reload } = useLearningProfile();
  return (
    <div className="auth-body">
      <div className="alert alert-danger" role="alert">
        <div className="alert-body">
          <span className="alert-title">Không tải được hồ sơ học tập</span>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={reload}
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
};
