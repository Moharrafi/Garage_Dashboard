"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const toastStyles = {
  success: "bg-black/90 dark:bg-white/95 text-white dark:text-black",
  error: "bg-black/90 dark:bg-white/95 text-white dark:text-black",
  warning: "bg-black/90 dark:bg-white/95 text-white dark:text-black",
  info: "bg-black/90 dark:bg-white/95 text-white dark:text-black",
}

const iconStyles = {
  success: "text-emerald-400 dark:text-emerald-500",
  error: "text-red-400 dark:text-red-500",
  warning: "text-amber-400 dark:text-amber-500",
  info: "text-blue-400 dark:text-blue-500",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container - iPhone style centered at top */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type]
          return (
            <div
              key={toast.id}
              className={`
                ${toastStyles[toast.type]}
                pointer-events-auto
                flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl
                min-w-[280px] max-w-[90vw]
                animate-in slide-in-from-top-4 fade-in duration-300
                backdrop-blur-xl
              `}
            >
              <Icon className={`h-5 w-5 shrink-0 ${iconStyles[toast.type]}`} />
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
