"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface ProgressStep {
  id: string
  title: string
  description?: string
  status: "pending" | "active" | "completed" | "error"
}

interface EnhancedProgressProps {
  steps: ProgressStep[]
  currentStep?: number
  showIcons?: boolean
  animated?: boolean
  className?: string
}

const stepIcons = {
  pending: Clock,
  active: Clock,
  completed: CheckCircle,
  error: AlertTriangle,
}

const stepColors = {
  pending: "text-slate-400 border-slate-600",
  active: "text-aramco-green-400 border-aramco-green-500",
  completed: "text-aramco-green-400 border-aramco-green-500",
  error: "text-red-400 border-red-500",
}

const stepBgColors = {
  pending: "bg-slate-700",
  active: "bg-aramco-green-500/20",
  completed: "bg-aramco-green-500/20",
  error: "bg-red-500/20",
}

export function EnhancedProgress({ 
  steps, 
  currentStep = 0, 
  showIcons = true, 
  animated = true,
  className = "" 
}: EnhancedProgressProps) {
  const [animatedSteps, setAnimatedSteps] = useState<number[]>([])

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedSteps(steps.map((_, index) => index))
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [steps, animated])

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => {
        const Icon = stepIcons[step.status]
        const isActive = index === currentStep
        const isCompleted = step.status === "completed"
        const isError = step.status === "error"
        const isAnimated = animatedSteps.includes(index)

        return (
          <div
            key={step.id}
            className={`
              relative p-4 rounded-xl border transition-all duration-500
              ${stepColors[step.status]}
              ${stepBgColors[step.status]}
              ${isAnimated ? 'animate-slide-in-up' : ''}
              ${isActive ? 'animate-border-glow' : ''}
              ${isCompleted ? 'hover-lift' : ''}
            `}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Shimmer effect for active step */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
              </div>
            )}

            <div className="relative flex items-start space-x-4">
              {/* Step number/icon */}
              <div className="flex-shrink-0">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${stepColors[step.status]}
                  ${isActive ? 'scale-110 animate-pulse-green' : ''}
                  ${isCompleted ? 'bg-aramco-green-500/20' : ''}
                  ${isError ? 'bg-red-500/20' : ''}
                `}>
                  {showIcons ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">
                      {isCompleted ? "✓" : index + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <h4 className={`
                  text-sm font-semibold transition-colors duration-300
                  ${isActive ? 'text-white' : 'text-slate-300'}
                `}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className="mt-1 text-xs text-slate-400">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                {isActive && (
                  <div className="w-2 h-2 bg-aramco-green-400 rounded-full animate-pulse"></div>
                )}
                {isCompleted && (
                  <CheckCircle className="w-5 h-5 text-aramco-green-400" />
                )}
                {isError && (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>

            {/* Progress line */}
            {index < steps.length - 1 && (
              <div className="absolute left-5 top-14 w-0.5 h-8 bg-slate-600">
                {isCompleted && (
                  <div className="w-full h-full bg-gradient-to-b from-aramco-green-500 to-aramco-green-400 animate-gradient-shift"></div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Circular progress component
interface CircularProgressProps {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export function CircularProgress({ 
  value, 
  max = 100, 
  size = "md", 
  showLabel = true,
  className = "" 
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = size === "sm" ? 20 : size === "lg" ? 40 : 30
  const strokeWidth = size === "sm" ? 3 : size === "lg" ? 6 : 4
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className="transform -rotate-90"
        width={radius * 2 + strokeWidth}
        height={radius * 2 + strokeWidth}
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          stroke="rgba(71, 85, 105, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#16a34a" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}

// Linear progress component
interface LinearProgressProps {
  value: number
  max?: number
  height?: "sm" | "md" | "lg"
  showLabel?: boolean
  animated?: boolean
  className?: string
}

export function LinearProgress({ 
  value, 
  max = 100, 
  height = "md", 
  showLabel = true,
  animated = true,
  className = "" 
}: LinearProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const heightClass = height === "sm" ? "h-2" : height === "lg" ? "h-4" : "h-3"

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {showLabel && (
          <span className="text-sm font-medium text-slate-300">
            Progress
          </span>
        )}
        {showLabel && (
          <span className="text-sm font-medium text-aramco-green-400">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      
      <div className={`w-full bg-slate-700 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`
            h-full bg-gradient-to-r from-aramco-green-500 to-aramco-blue-500
            rounded-full transition-all duration-1000 ease-out
            ${animated ? 'animate-gradient-shift' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
} 