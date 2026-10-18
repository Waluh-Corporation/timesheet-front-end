"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { IconCircleCheck, IconAlertCircle, IconInfoCircle, IconX } from "@tabler/icons-react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  notify: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + (++toastCounter);
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1090 }}>
        {toasts.map((t) => {
          const Icon =
            t.kind === "success" ? IconCircleCheck : t.kind === "error" ? IconAlertCircle : IconInfoCircle;
          const statusClass =
            t.kind === "success" ? "status-green" : t.kind === "error" ? "status-red" : "status-blue";
          const iconColor =
            t.kind === "success" ? "text-success" : t.kind === "error" ? "text-danger" : "text-primary";

          return (
            <div
              key={t.id}
              className="toast show shadow-sm mb-2"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <div className="toast-header">
                <span className={`status-dot ${statusClass} me-2`}></span>
                <strong className="me-auto text-capitalize">{t.kind}</strong>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => removeToast(t.id)}
                ></button>
              </div>
              <div className="toast-body d-flex align-items-center gap-2">
                <Icon size={18} className={iconColor} />
                <span className="small">{t.message}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { notify: (m: string) => console.log(m) };
  return ctx;
}
