"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useToastStore, type ToastType } from "@/store/toastStore"
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/cn"

const iconMap: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const glassMap: Record<ToastType, string> = {
  success: "glass-emerald text-emerald-900",
  error: "glass-red text-red-900",
  info: "glass-blue text-sky-900",
  warning: "glass-amber text-amber-900",
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
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-[2rem] p-5 shadow-bento",
                glassMap[toast.type]
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColorMap[toast.type])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold tracking-tight">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs mt-0.5 opacity-70 font-medium">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 rounded-xl p-1 opacity-40 hover:opacity-100 transition-opacity"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
