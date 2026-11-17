import { Navigate, Outlet } from "react-router-dom";

import { useLearningProfile } from "../../contexts/useLearningProfile";
import { ROUTES } from "../../shared/routes";
import { ProfileLoadError, ProfileLoading } from "./ProfileGate";

/**
 * Learner screens need a learning profile. Not onboarded yet (404) → the
 * onboarding form. Used inside RequireAuth role="USER".
 */
const RequireProfile = () => {
  const { status } = useLearningProfile();
  if (status === "loading" || status === "idle") return <ProfileLoading />;
  if (status === "error") return <ProfileLoadError />;
  if (status === "missing") return <Navigate to={ROUTES.onboarding} replace />;
  return <Outlet />;
};

export default RequireProfile;
