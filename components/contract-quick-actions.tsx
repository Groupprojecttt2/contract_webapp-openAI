"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  User,
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Send,
  Loader2,
  Sparkles,
  Edit3,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

interface ContractQuickActionsProps {
  contractContent: string
  contractId: string
  onContractUpdate: (updatedContent: string) => void
  onReset: () => void
}

export function ContractQuickActions({
  contractContent,
  contractId,
  onContractUpdate,
  onReset,
}: ContractQuickActionsProps) {
  const [customRequest, setCustomRequest] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastAction, setLastAction] = useState("")
  const [actionResults, setActionResults] = useState<{ [key: string]: { success: boolean; message: string } }>({})

  const quickActions = [
    {
      id: "party-a",
      label: "Change Party A Name",
      icon: <User className="w-4 h-4" />,
      placeholder: "Enter new Party A name...",
      example: "Change Party A to 'Aramco Digital Solutions'",
      color: "text-blue-400",
    },
    {
      id: "party-b",
      label: "Change Party B Name",
      icon: <User className="w-4 h-4" />,
      placeholder: "Enter new Party B name...",
      example: "Change Party B to 'TechCorp Industries'",
      color: "text-green-400",
    },
    {
      id: "amount",
      label: "Update Contract Value",
      icon: <DollarSign className="w-4 h-4" />,
      placeholder: "Enter new amount...",
      example: "Change contract value to $150,000",
      color: "text-emerald-400",
    },
    {
      id: "date",
      label: "Update Dates",
      icon: <Calendar className="w-4 h-4" />,
      placeholder: "Enter new date...",
      example: "Change start date to January 15, 2025",
      color: "text-purple-400",
    },
    {
      id: "location",
      label: "Change Location",
      icon: <MapPin className="w-4 h-4" />,
      placeholder: "Enter new location...",
      example: "Change jurisdiction to 'State of California'",
      color: "text-orange-400",
    },
    {
      id: "terms",
      label: "Modify Terms",
      icon: <FileText className="w-4 h-4" />,
      placeholder: "Describe term changes...",
      example: "Add 30-day notice period for termination",
      color: "text-pink-400",
    },
  ]

  const handleQuickAction = async (actionId: string, value: string) => {
    if (!value.trim()) return

    setIsProcessing(true)
    setLastAction(actionId)

    try {
      const response = await fetch("/api/contracts/quick-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractContent,
          contractId,
          action: actionId,
          value: value.trim(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        onContractUpdate(data.updatedContract)
        setActionResults({
          ...actionResults,
          [actionId]: { success: true, message: "Contract updated successfully!" },
        })
        // Clear the input field
        const input = document.querySelector(`input[data-action="${actionId}"]`) as HTMLInputElement
        if (input) input.value = ""

        // Clear result after 3 seconds
        setTimeout(() => {
          setActionResults((prev) => {
            const newResults = { ...prev }
            delete newResults[actionId]
            return newResults
          })
        }, 3000)
      } else {
        setActionResults({
          ...actionResults,
          [actionId]: { success: false, message: data.error || "Failed to update contract" },
        })
      }
    } catch (error) {
      console.error("Quick action error:", error)
      setActionResults({
        ...actionResults,
        [actionId]: { success: false, message: "Network error. Please try again." },
      })
    } finally {
      setIsProcessing(false)
      setLastAction("")
    }
  }

  const handleCustomRequest = async () => {
    if (!customRequest.trim()) return

    setIsProcessing(true)
    setLastAction("custom")

    try {
      const response = await fetch("/api/contracts/quick-edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contractContent,
          contractId,
          action: "custom",
          value: customRequest.trim(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        onContractUpdate(data.updatedContract)
        setActionResults({
          ...actionResults,
          custom: { success: true, message: "Custom changes applied successfully!" },
        })
        setCustomRequest("")

        // Clear result after 3 seconds
        setTimeout(() => {
          setActionResults((prev) => {
            const newResults = { ...prev }
            delete newResults.custom
            return newResults
          })
        }, 3000)
      } else {
        setActionResults({
          ...actionResults,
          custom: { success: false, message: data.error || "Failed to update contract" },
        })
      }
    } catch (error) {
      console.error("Custom request error:", error)
      setActionResults({
        ...actionResults,
        custom: { success: false, message: "Network error. Please try again." },
      })
    } finally {
      setIsProcessing(false)
      setLastAction("")
    }
  }

  const resetContract = () => {
    if (confirm("Are you sure you want to reset all changes made in this session? This cannot be undone.")) {
      onReset()
      setActionResults({})
    }
  }

  return (
    <Card className="aramco-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 aramco-text-primary animate-pulse" />
          Interactive Quick Actions
          <Badge className="aramco-accent-green text-xs">Live Editing</Badge>
        </CardTitle>
        <CardDescription className="text-aramco-dark-300">
          Make instant changes to your contract and see them applied in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Action Buttons */}
        <div className="space-y-4">
          {quickActions.map((action) => (
            <div key={action.id} className="space-y-2">
              <div className={`flex items-center gap-2 text-sm font-medium text-white`}>
                <span className={action.color}>{action.icon}</span>
                {action.label}
              </div>
              <div className="flex gap-2">
                <Input
                  data-action={action.id}
                  placeholder={action.placeholder}
                  className="aramco-input text-sm"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleQuickAction(action.id, e.currentTarget.value)
                    }
                  }}
                  disabled={isProcessing}
                />
                <Button
                  size="sm"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector("input") as HTMLInputElement
                    if (input?.value) {
                      handleQuickAction(action.id, input.value)
                    }
                  }}
                  disabled={isProcessing}
                  className="aramco-button-secondary px-3"
                >
                  {isProcessing && lastAction === action.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Action Result */}
              {actionResults[action.id] && (
                <div
                  className={`flex items-center gap-2 p-2 rounded text-sm ${
                    actionResults[action.id].success
                      ? "bg-green-500/10 border border-green-500/30 text-green-300"
                      : "bg-red-500/10 border border-red-500/30 text-red-300"
                  }`}
                >
                  {actionResults[action.id].success ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{actionResults[action.id].message}</span>
                </div>
              )}

              <p className="text-xs text-aramco-dark-400 italic">Example: {action.example}</p>
            </div>
          ))}
        </div>

        {/* Custom Request */}
        <div className="space-y-3 pt-4 border-t border-aramco-dark-600">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 aramco-text-secondary" />
            <span className="font-medium text-white">Custom Request</span>
            <Badge className="aramco-accent-blue text-xs">AI Powered</Badge>
          </div>

          <Textarea
            placeholder="Describe any changes you want to make to the contract... 
Examples:
• Change the payment terms to net 45 days
• Add a confidentiality clause
• Update the termination notice to 60 days
• Change the governing law to New York
• Add force majeure clause"
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            className="aramco-input min-h-[100px] text-sm"
            disabled={isProcessing}
          />

          <Button
            onClick={handleCustomRequest}
            disabled={!customRequest.trim() || isProcessing}
            className="w-full aramco-button-primary"
          >
            {isProcessing && lastAction === "custom" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Request...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Custom Changes
              </>
            )}
          </Button>

          {/* Custom Action Result */}
          {actionResults.custom && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                actionResults.custom.success
                  ? "bg-green-500/10 border border-green-500/30 text-green-300"
                  : "bg-red-500/10 border border-red-500/30 text-red-300"
              }`}
            >
              {actionResults.custom.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">{actionResults.custom.message}</span>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-aramco-dark-600">
          <Button
            onClick={resetContract}
            variant="outline"
            className="w-full bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset All Changes
          </Button>
        </div>

        {/* Live Status */}
        <div className="flex items-center justify-center gap-2 p-2 bg-aramco-green-500/10 border border-aramco-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-aramco-green-400 rounded-full animate-pulse"></div>
          <span className="text-aramco-green-300 text-xs font-medium">Live Contract Editing Active</span>
        </div>
      </CardContent>
    </Card>
  )
}
