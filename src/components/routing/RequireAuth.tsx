import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../contexts/useAuth";
import { ROUTES, homePathFor } from "../../shared/routes";
import type { UserRole } from "../../types/authTypes";

interface RequireAuthProps {
  /** Only this role may open the routes; the other role goes to its own home. */
  role: UserRole;
}

/**
 * Guards logged-in routes like the design's render():
 * guest → /login (and back here after logging in), wrong role → own home.
 */
const RequireAuth = ({ role }: RequireAuthProps) => {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="auth-body" role="status">
        <span className="od-row muted">
          <span className="spinner" aria-hidden="true" />
          Đang tải phiên đăng nhập…
        </span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }
  if (user.role !== role) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }
  return <Outlet />;
};

export default RequireAuth;
