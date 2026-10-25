import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

import { ROUTES } from "../../shared/routes";
import Brand from "../Brand";
import Mascot from "../Mascot";
import SkipLink from "./SkipLink";

interface AuthLayoutProps {
  title: string;
  lead: string;
  /** Show the "Đăng nhập | Đăng ký" tabs (login and register pages). */
  withTabs?: boolean;
  children: ReactNode;
}

/** Focused layout of the design's /auth screen: top bar + centered card with the bear. */
const AuthLayout = ({
  title,
  lead,
  withTabs = false,
  children,
}: AuthLayoutProps) => (
  <>
    <SkipLink />
    <div className="auth-wrap">
      <header className="focus-bar">
        <Brand to={ROUTES.landing} />
        <Link className="btn btn-ghost btn-sm" to={ROUTES.landing}>
          Về trang chủ
        </Link>
      </header>
      <main id="main" className="auth-body" tabIndex={-1}>
        <div className="card auth-card">
          <Mascot className="auth-mascot" />
          <div className="od-stack">
            <h1 id="page-title" tabIndex={-1} className="h-auth">
              {title}
            </h1>
            <p className="muted">{lead}</p>
          </div>
          {withTabs && (
            <nav className="tabs" aria-label="Chọn chế độ">
              <NavLink className="tab" to={ROUTES.login}>
                Đăng nhập
              </NavLink>
              <NavLink className="tab" to={ROUTES.register}>
                Đăng ký
              </NavLink>
            </nav>
          )}
          {children}
        </div>
      </main>
    </div>
  </>
);

export default AuthLayout;
