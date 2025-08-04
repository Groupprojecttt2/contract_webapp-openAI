"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { Button } from "./button"

interface ToastProps {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastColors = {
  success: "border-aramco-green-500/30 bg-aramco-green-500/10 text-aramco-green-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  info: "border-aramco-blue-500/30 bg-aramco-blue-500/10 text-aramco-blue-400",
}

export function EnhancedToast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const Icon = toastIcons[type]

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100)
    
    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(timer)
      clearTimeout(dismissTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
    >
      <div className={`
        relative p-4 rounded-xl border backdrop-blur-enhanced
        ${toastColors[type]}
        shadow-2xl animate-fade-in-scale
      `}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
        </div>
        
        <div className="relative flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Icon className="w-5 h-5 aramco-icon-glow" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            {message && (
              <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted focus-ring"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30 rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-aramco-green-500 to-aramco-blue-500 transition-all duration-300 ease-linear"
            style={{
              width: isExiting ? '0%' : '100%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast) => (
        <EnhancedToast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id, onClose: removeToast }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }

  const showError = (title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }

  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }

  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }

  return {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  }
} 