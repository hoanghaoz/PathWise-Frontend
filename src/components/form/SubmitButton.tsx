import type { ReactNode } from "react";

import { cx } from "../../shared/cx";

interface SubmitButtonProps {
  loading: boolean;
  /** Shown with a spinner while loading, e.g. "Đang đăng nhập…". */
  loadingText: string;
  block?: boolean;
  children: ReactNode;
}

const SubmitButton = ({
  loading,
  loadingText,
  block = false,
  children,
}: SubmitButtonProps) => (
  <button
    className={cx("btn btn-primary", block && "btn-block")}
    type="submit"
    disabled={loading}
  >
    {loading ? (
      <>
        <span className="spinner" aria-hidden="true" />
        {loadingText}
      </>
    ) : (
      children
    )}
  </button>
);

export default SubmitButton;
