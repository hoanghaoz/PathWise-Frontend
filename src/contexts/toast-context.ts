import { createContext } from "react";

export type ToastKind = "ok" | "warn";

export interface ToastContextValue {
  /** Shows a short status message at the bottom of the screen for 3.6s. */
  showToast: (message: string, kind?: ToastKind) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);
