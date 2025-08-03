"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Brain, Search, Shield, DollarSign, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { saveAs } from "file-saver"

interface ContractAIToolsProps {
  contractContent: string
  contractId: string
}

export function ContractAITools({ contractContent }: ContractAIToolsProps) {
  const [analysisType, setAnalysisType] = useState("comprehensive")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState("")
  const [isImproving, setIsImproving] = useState(false)
  const [improvedContract, setImprovedContract] = useState("")
  const [improvementConcerns, setImprovementConcerns] = useState("")
  const [showCompare, setShowCompare] = useState(false)
  const [originalContent, setOriginalContent] = useState("")
  const [aiDiffSummary, setAiDiffSummary] = useState("")

  useEffect(() => {
    // Store the original contract content on mount
    setOriginalContent(contractContent)
  }, [contractContent])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
              const response = await fetch("/api/contracts/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contractContent,
          analysisType,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setAnalysis(data.analysis)
      } else {
        alert(data.error || "Analysis failed")
      }
    } catch (error) {
      console.error("Analysis error:", error)
      alert("Network error. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImprove = async () => {
    setIsImproving(true)
    try {
      // Store the original contract before improvement
      setOriginalContent(contractContent)
      const response = await fetch("/api/contracts/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contractContent,
          improvementType: "general",
          specificConcerns: improvementConcerns,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setImprovedContract(data.improvedContract)
      } else {
        alert(data.error || "Improvement failed")
      }
    } catch (error) {
      console.error("Improvement error:", error)
      alert("Network error. Please try again.")
    } finally {
      setIsImproving(false)
    }
  }

  // Download improved contract as .txt
  const downloadImprovedContract = () => {
    console.log("Download button clicked")
    if (!improvedContract || improvedContract.trim() === "") {
      alert("No improved contract available to download. Please improve the contract first.")
      return
    }
    const blob = new Blob([improvedContract], { type: "text/plain;charset=utf-8" })
    saveAs(blob, "Improved_Contract.txt")
  }

  const handleCompareClick = async () => {
    console.log("Compare button clicked")
    if (!improvedContract || improvedContract.trim() === "") {
      alert("No improved contract available to compare. Please improve the contract first.")
      return
    }
    if (!originalContent || originalContent.trim() === "") {
      alert("No original contract found for comparison.")
      return
    }
    await getAIDiffSummary(originalContent, improvedContract)
    setShowCompare(true)
  }

  // Simple diff function (line by line)
  const getDiff = (a: string, b: string) => {
    const aLines = a.split("\n")
    const bLines = b.split("\n")
    let diff = []
    for (let i = 0; i < Math.max(aLines.length, bLines.length); i++) {
      if (aLines[i] !== bLines[i]) {
        diff.push({
          original: aLines[i] || "",
          improved: bLines[i] || "",
        })
      }
    }
    return diff
  }

  // Simulate AI diff summary (placeholder)
  const getAIDiffSummary = async (original: string, improved: string) => {
    setAiDiffSummary("AI Summary: The improved contract clarifies terms and adds missing clauses.")
  }

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case "risk":
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case "compliance":
        return <Shield className="w-5 h-5 text-blue-400" />
      case "financial":
        return <DollarSign className="w-5 h-5 text-green-400" />
      default:
        return <Search className="w-5 h-5 text-purple-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis */}
      <Card className="aramco-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 aramco-text-primary" />
            AI Contract Analysis
          </CardTitle>
          <CardDescription className="text-aramco-dark-300">
            Get AI-powered insights and analysis of your contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-white font-medium">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger className="aramco-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-aramco-dark-800 border-aramco-dark-700">
                <SelectItem value="comprehensive">Comprehensive Review</SelectItem>
                <SelectItem value="risk">Risk Assessment</SelectItem>
                <SelectItem value="compliance">Legal Compliance</SelectItem>
                <SelectItem value="financial">Financial Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full aramco-button-secondary">
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Contract...
              </>
            ) : (
              <>
                {getAnalysisIcon(analysisType)}
                <span className="ml-2">Analyze Contract</span>
              </>
            )}
          </Button>
          {analysis && (
            <div className="mt-4 p-4 bg-aramco-dark-700/50 rounded-lg border border-aramco-dark-600/50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-aramco-green-400" />
                <span className="font-semibold text-white">Analysis Complete</span>
                <Badge className="aramco-accent-green">{analysisType}</Badge>
              </div>
              <div className="text-aramco-dark-300 whitespace-pre-wrap text-sm leading-relaxed max-h-60 overflow-y-auto">
                {analysis}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* AI Improvement */}
      <Card className="aramco-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 aramco-text-secondary" />
            AI Contract Improvement
          </CardTitle>
          <CardDescription className="text-aramco-dark-300">
            Get AI suggestions to improve your contract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-white font-medium">Specific Concerns (Optional)</label>
            <Textarea
              placeholder="Describe any specific areas you'd like to improve or concerns you have..."
              value={improvementConcerns}
              onChange={(e) => setImprovementConcerns(e.target.value)}
              className="aramco-input min-h-[80px]"
            />
          </div>
          <Button onClick={handleImprove} disabled={isImproving} className="w-full aramco-button-primary">
            {isImproving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Improving Contract...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Improve Contract
              </>
            )}
          </Button>
          {improvedContract && (
            <div className="mt-4 p-4 bg-aramco-dark-700/50 rounded-lg border border-aramco-dark-600/50">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-aramco-green-400" />
                <span className="font-semibold text-white">Improvement Complete</span>
                <Badge className="aramco-accent-blue">Enhanced</Badge>
              </div>
              <div className="text-aramco-dark-300 whitespace-pre-wrap text-sm leading-relaxed max-h-60 overflow-y-auto">
                {improvedContract}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={downloadImprovedContract}
                  className="aramco-button-secondary"
                  disabled={!improvedContract || improvedContract.trim() === ""}
                >
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCompareClick}
                  className="aramco-button-secondary"
                  disabled={!improvedContract || improvedContract.trim() === ""}
                >
                  Compare
                </Button>
              </div>
            </div>
          )}
          {/* Compare Modal/Section */}
          {showCompare && (
            <div className="mt-6 p-4 bg-black/80 rounded-lg border border-aramco-blue-600/40">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white">Compare Original vs Improved</span>
                <Button size="sm" variant="ghost" onClick={() => setShowCompare(false)}>Close</Button>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <div className="font-semibold text-aramco-accent-blue mb-2">Original</div>
                  <pre className="bg-aramco-dark-800 p-2 rounded text-xs overflow-x-auto max-h-64">{originalContent}</pre>
                </div>
                <div className="w-1/2">
                  <div className="font-semibold text-aramco-accent-green mb-2">Improved</div>
                  <pre className="bg-aramco-dark-800 p-2 rounded text-xs overflow-x-auto max-h-64">{improvedContract}</pre>
                </div>
              </div>
              <div className="mt-4 text-aramco-accent-yellow text-sm">
                {aiDiffSummary}
              </div>
              <div className="mt-2">
                <span className="font-medium text-white">Changed Lines:</span>
                <ul className="text-xs text-aramco-accent-red list-disc ml-6">
                  {getDiff(originalContent, improvedContract).map((d, i) => (
                    <li key={i}>
                      <span className="text-aramco-accent-blue">Original:</span> {d.original}
                      <br />
                      <span className="text-aramco-accent-green">Improved:</span> {d.improved}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
