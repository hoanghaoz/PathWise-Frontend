import { Link } from "react-router-dom";

import bear from "../assets/pathwise-bear.png";

interface BrandProps {
  to: string;
  admin?: boolean;
}

/** Logo: full-body PathWise bear + "Path" (mint) "Wise" (navy) wordmark. */
const Brand = ({ to, admin = false }: BrandProps) => (
  <Link className="brand" to={to} aria-label="PathWise — trang chính">
    <img className="brand-mark" src={bear} width={547} height={478} alt="" />
    <span className="wordmark" aria-hidden="true">
      <span className="wm-path">Path</span>
      <span className="wm-wise">Wise</span>
    </span>
    {admin && <small>Admin</small>}
  </Link>
);

export default Brand;
