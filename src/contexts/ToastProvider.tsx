import { useCallback, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import Icon from "../components/Icon";
import { ToastContext } from "./toast-context";
import type { ToastKind } from "./toast-context";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const TOAST_MS = 3600;

/** Toasts styled by the design's `.toast-root` / `.toast` classes. */
const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, kind: ToastKind = "ok") => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { id, message, kind }]);
    window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, TOAST_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-root" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <Icon name={t.kind === "warn" ? "alert" : "check"} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
