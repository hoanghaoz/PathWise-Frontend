import type { UserRole } from "../types/authTypes";

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  // Learner app
  roadmap: "/roadmap",
  progress: "/progress",
  result: "/result",
  profile: "/profile",
  // Admin app
  adminDirections: "/admin/directions",
  adminGraph: "/admin/graph",
  adminContent: "/admin/content",
  adminStats: "/admin/stats",
} as const;

/** Where a user lands after logging in (same as the design). */
export const homePathFor = (role: UserRole): string =>
  role === "ADMIN" ? ROUTES.adminGraph : ROUTES.roadmap;
