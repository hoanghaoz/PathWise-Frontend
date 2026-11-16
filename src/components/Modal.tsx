import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cx } from "../shared/cx";
import Icon from "./Icon";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Footer buttons (cancel / confirm). */
  footer?: ReactNode;
  wide?: boolean;
  /** Use for confirmations so screen readers announce it as an alert. */
  alert?: boolean;
}

/**
 * Design-system dialog (modal-root / modal-backdrop / modal): closes on Escape
 * or a backdrop click, focuses the first field when it opens and gives focus
 * back to the element that opened it when it closes.
 */
const Modal = ({
  title,
  onClose,
  children,
  footer,
  wide = false,
  alert = false,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>(
      ".modal-body input:not([disabled]), .modal-body select, .modal-body textarea, .modal-foot .btn",
    );
    (first ?? dialog?.querySelector<HTMLElement>(".icon-btn"))?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, []);

  return (
    <div className="modal-root">
      <div className="modal-backdrop" onClick={onClose} />
      <div
        ref={dialogRef}
        className={cx("modal", wide && "modal-wide")}
        role={alert ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-head">
          <h2 id="modal-title">{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
          >
            <Icon name="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
