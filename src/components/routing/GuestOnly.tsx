import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Location } from "react-router-dom";

import { useAuth } from "../../contexts/useAuth";
import { homePathFor } from "../../shared/routes";

/**
 * Login/register pages. Once a user exists (already logged in, or the form
 * just succeeded) it redirects: back to the page RequireAuth bounced from,
 * otherwise to the role's home. Pages therefore never navigate themselves.
 */
const GuestOnly = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (user) {
    const from = (location.state as { from?: Location } | null)?.from;
    return (
      <Navigate
        to={from ? `${from.pathname}${from.search}` : homePathFor(user.role)}
        replace
      />
    );
  }
  return <Outlet />;
};

export default GuestOnly;
