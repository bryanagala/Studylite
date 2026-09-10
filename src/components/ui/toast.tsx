"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: string; message: string; type?: "success" | "error" | "info" };

const ToastContext = createContext<{
  toast: (message: string, type?: Toast["type"]) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = `${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-1/2 z-[100] flex w-[min(92vw,24rem)] -translate-x-1/2 flex-col gap-2 md:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-in rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg",
              t.type === "error" && "bg-rose-500",
              t.type === "info" && "bg-slate-800",
              t.type === "success" && "bg-emerald-600"
            )}
            role="status"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
