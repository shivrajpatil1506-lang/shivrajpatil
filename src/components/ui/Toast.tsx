"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---- Types ----
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

// ---- Context ----
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ---- Single Toast ----
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
  error:   <XCircle    className="w-5 h-5 text-red-500 shrink-0" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />,
  info:    <Info        className="w-5 h-5 text-blue-500 shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50",
  error:   "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  info:    "border-blue-200 bg-blue-50",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const duration = toast.duration ?? 4000;
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 rounded-xl border shadow-lg px-4 py-3.5 transition-all duration-300",
        STYLES[toast.type],
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      {ICONS[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900">{toast.title}</p>
        {toast.message && <p className="text-xs text-neutral-600 mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        className="p-0.5 rounded hover:bg-black/5 transition-colors shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5 text-neutral-500" />
      </button>
    </div>
  );
}

// ---- Provider + Container ----
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { ...opts, id }]); // max 5 at once
  }, []);

  const value: ToastContextValue = {
    toast:   add,
    success: (title, message) => add({ type: "success", title, message }),
    error:   (title, message) => add({ type: "error",   title, message }),
    warning: (title, message) => add({ type: "warning", title, message }),
    info:    (title, message) => add({ type: "info",    title, message }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container — bottom right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
