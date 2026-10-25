import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/useAuth";
import { useToast } from "../../contexts/useToast";
import { cx } from "../../shared/cx";
import { ROUTES, homePathFor } from "../../shared/routes";
import Brand from "../Brand";
import Icon from "../Icon";
import SkipLink from "./SkipLink";

const USER_NAV = [
  { to: ROUTES.roadmap, label: "Lộ trình" },
  { to: ROUTES.progress, label: "Tiến độ" },
  { to: ROUTES.result, label: "Kết quả đánh giá" },
  { to: ROUTES.profile, label: "Hồ sơ" },
];

const ADMIN_NAV = [
  { to: ROUTES.adminDirections, label: "Hướng học" },
  { to: ROUTES.adminGraph, label: "Skill graph" },
  { to: ROUTES.adminContent, label: "Tài liệu & câu hỏi" },
  { to: ROUTES.adminStats, label: "Thống kê" },
];

/**
 * Logged-in layout (Design Spec 2.0): sticky top nav with logo, text links
 * (aria-current on the active one) and the account + logout button.
 */
const AppShell = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  if (!user) return null; // RequireAuth renders this only with a user
  const admin = user.role === "ADMIN";
  const nav = admin ? ADMIN_NAV : USER_NAV;

  const onLogout = async () => {
    await logout();
    showToast("Đã đăng xuất.");
    navigate(ROUTES.landing);
  };

  return (
    <>
      <SkipLink />
      <div className="shell-top">
        <header className="topnav">
          <div className={cx("topnav-in", admin && "wide")}>
            <Brand to={homePathFor(user.role)} admin={admin} />
            <nav className="topnav-links" aria-label="Điều hướng chính">
              {nav.map((item) => (
                <NavLink key={item.to} className="tn-link" to={item.to}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="topnav-user">
              <span className="tn-name od-truncate">{user.username}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={onLogout}
                aria-label={`Đăng xuất (${user.email})`}
                title="Đăng xuất"
              >
                <Icon name="logout" />
              </button>
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AppShell;
