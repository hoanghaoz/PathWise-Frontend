import { useContext } from "react";

import { LearningProfileContext } from "./learning-profile-context";

export const useLearningProfile = () => {
  const ctx = useContext(LearningProfileContext);
  if (!ctx) {
    throw new Error(
      "useLearningProfile must be used inside <LearningProfileProvider>",
    );
  }
  return ctx;
};
