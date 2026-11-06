import { Navigate, Outlet } from "react-router-dom";

import { useLearningProfile } from "../../contexts/useLearningProfile";
import { ROUTES } from "../../shared/routes";
import { ProfileLoadError, ProfileLoading } from "./ProfileGate";

/** Onboarding is only for users without a profile; others go to the app. */
const OnboardingOnly = () => {
  const { status } = useLearningProfile();
  if (status === "loading" || status === "idle") return <ProfileLoading />;
  if (status === "error") return <ProfileLoadError />;
  if (status === "ready") return <Navigate to={ROUTES.roadmap} replace />;
  return <Outlet />;
};

export default OnboardingOnly;
