"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Shield,
  DollarSign,
  Gavel,
  Settings,
  Users,
  Target,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

interface RiskScore {
  overall: number
  legal: number
  financial: number
  operational: number
  compliance: number
  reputation: number
}

interface RiskCategory {
  name: string
  score: number
  level: "low" | "medium" | "high" | "critical"
  color: string
  description: string
  recommendations: string[]
}

interface RiskAnalysis {
  overallScore: RiskScore
  categories: RiskCategory[]
  criticalIssues: string[]
  recommendations: string[]
  industryBenchmark: string
  riskTrend: "improving" | "stable" | "worsening"
  confidence: number
}

interface RiskAnalysisDashboardProps {
  contractContent: string
  industry?: string
  contractType?: string
}

export function RiskAnalysisDashboard({ 
  contractContent, 
  industry = "general", 
  contractType = "general" 
}: RiskAnalysisDashboardProps) {
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeRisk = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/contracts/risk-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contractContent,
          industry,
          contractType,
        }),
      })

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      const data = await response.json()
      
      if (data.success) {
        setRiskAnalysis(data.riskAnalysis)
      } else {
        setError(data.error || "Failed to analyze risk")
      }
    } catch (err) {
      console.error("Risk analysis error:", err);
      if (err instanceof Error) {
        if (err.message.includes("non-JSON")) {
          setError("Server error: Received invalid response. Please try again.")
        } else if (err.message.includes("quota")) {
          setError("OpenAI quota exceeded. Please check your billing and try again later.")
        } else {
          setError(`Connection error: ${err.message}`)
        }
      } else {
        setError("Failed to connect to risk analysis service")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contractContent) {
      analyzeRisk()
    }
  }, [contractContent, industry, contractType])

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500 text-white"
      case "high": return "bg-orange-500 text-white"
      case "medium": return "bg-yellow-500 text-black"
      case "low": return "bg-green-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case "critical": return <XCircle className="w-4 h-4" />
      case "high": return <AlertTriangle className="w-4 h-4" />
      case "medium": return <Minus className="w-4 h-4" />
      case "low": return <CheckCircle className="w-4 h-4" />
      default: return <Minus className="w-4 h-4" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingDown className="w-4 h-4 text-green-500" />
      case "worsening": return <TrendingUp className="w-4 h-4 text-red-500" />
      case "stable": return <Minus className="w-4 h-4 text-yellow-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "legal": return <Gavel className="w-4 h-4" />
      case "financial": return <DollarSign className="w-4 h-4" />
      case "operational": return <Settings className="w-4 h-4" />
      case "compliance": return <Shield className="w-4 h-4" />
      case "reputation": return <Users className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card className="aramco-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 animate-spin" />
            Analyzing Contract Risk...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={33} className="w-full" />
            <p className="text-aramco-dark-300">Performing comprehensive risk analysis...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="aramco-card">
        <CardHeader>
          <CardTitle className="text-white">Risk Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={analyzeRisk} className="mt-4">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!riskAnalysis) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card className="aramco-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Overall Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-aramco-dark-600 flex items-center justify-center">
                  <div className="text-2xl font-bold text-white">
                    {riskAnalysis.overallScore.overall}
                  </div>
                </div>
                <div className="absolute -top-2 -right-2">
                  {getRiskLevelIcon(riskAnalysis.overallScore.overall >= 80 ? "critical" : 
                                   riskAnalysis.overallScore.overall >= 60 ? "high" : 
                                   riskAnalysis.overallScore.overall >= 40 ? "medium" : "low")}
                </div>
              </div>
              <p className="text-sm text-aramco-dark-300 mt-2">Overall Risk Score</p>
            </div>

            {/* Risk Trend */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getTrendIcon(riskAnalysis.riskTrend)}
                <span className="text-white font-semibold capitalize">
                  {riskAnalysis.riskTrend}
                </span>
              </div>
              <p className="text-sm text-aramco-dark-300">Risk Trend</p>
            </div>

            {/* Confidence */}
            <div className="text-center">
              <div className="text-2xl font-bold text-aramco-green-400">
                {riskAnalysis.confidence}%
              </div>
              <p className="text-sm text-aramco-dark-300">Analysis Confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Categories */}
      <Card className="aramco-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Risk Categories Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskAnalysis.categories.map((category, index) => (
              <div key={index} className="p-4 bg-aramco-dark-800 rounded-lg border border-aramco-dark-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category.name)}
                    <h3 className="font-semibold text-white">{category.name}</h3>
                  </div>
                  <Badge className={getRiskLevelColor(category.level)}>
                    {category.level.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-aramco-dark-300">Risk Score</span>
                    <span className="text-white">{category.score}/100</span>
                  </div>
                  <Progress value={category.score} className="w-full" />
                </div>

                <p className="text-sm text-aramco-dark-300 mb-3">
                  {category.description}
                </p>

                {category.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-aramco-green-400 mb-2">Recommendations:</p>
                    <ul className="text-xs text-aramco-dark-300 space-y-1">
                      {category.recommendations.slice(0, 2).map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start gap-2">
                          <span className="text-aramco-green-400 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Issues */}
        <Card className="aramco-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskAnalysis.criticalIssues.length > 0 ? (
              <div className="space-y-3">
                {riskAnalysis.criticalIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-aramco-dark-200">{issue}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-aramco-dark-300 text-sm">No critical issues identified.</p>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="aramco-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskAnalysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-aramco-dark-200">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Industry Benchmark */}
      <Card className="aramco-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Industry Benchmark
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-aramco-dark-200">{riskAnalysis.industryBenchmark}</p>
        </CardContent>
      </Card>
    </div>
  )
} 