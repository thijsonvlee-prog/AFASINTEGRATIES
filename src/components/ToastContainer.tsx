"use client"

import React from "react"
import { useToastStore, type ToastType } from "@/store/toastStore"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/cn"

const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const styleMap: Record<ToastType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
}

const iconColorMap: Record<ToastType, string> = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-sky-500",
  warning: "text-amber-500",
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-3xl border p-4 shadow-lg animate-toast-enter glass",
              styleMap[toast.type]
            )}
          >
            <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColorMap[toast.type])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="text-xs mt-0.5 opacity-80">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-md p-0.5 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
