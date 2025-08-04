"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  ArrowLeft,
  Upload,
  Brain,
  Search,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileCheck,
  Lightbulb,
  Shield,
  DollarSign,
  Scale,
  Loader2,
  Download,
  Eye,
  Sparkles,
  X,
} from "lucide-react"
import Link from "next/link"
import { app } from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import saveAs from "file-saver";

export default function ContractSuitePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [contractText, setContractText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any | null>(null)
  const [improvementResult, setImprovementResult] = useState<string>("")
  const [activeTab, setActiveTab] = useState("upload")
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showCompare, setShowCompare] = useState(false);
  const [originalContent, setOriginalContent] = useState("");
  const [improvedContent, setImprovedContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const recentRef = useRef<HTMLDivElement>(null);
  const sharedRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState("recent");

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchContracts = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;
      const db = getFirestore(app);
      const contractsQuery = query(collection(db, "contracts"), where("user_id", "==", user.uid));
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsData = contractsSnapshot.docs.map(doc => doc.data());
      // setContracts(contractsData || []); // This line was removed as per the edit hint
    };
    fetchContracts();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessingFile(true)
    setUploadedFile(file)

    try {
      if (file.type === "text/plain") {
        // Handle text files directly
        const text = await file.text()
        setContractText(text)
        setIsProcessingFile(false)
        return
      }

      // Handle PDF and Word documents
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileName", file.name)
      formData.append("fileType", file.type)

      let endpoint = ""
      if (file.type === "application/pdf") {
        endpoint = "/api/ai/process-pdf"
      } else if (file.type.includes("document") || file.type.includes("msword")) {
        endpoint = "/api/ai/process-document"
      } else {
        throw new Error("Unsupported file type. Please upload PDF, Word, or text files.")
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success && result.text) {
        setContractText(result.text)
        console.log(`✅ Successfully processed ${file.name}`)
      } else {
        throw new Error(result.error || "Failed to process file")
      }
    } catch (error) {
      console.error("File processing error:", error);
      alert(`Error processing file: ${(error as Error).message}`);
      setUploadedFile(null);
    } finally {
      setIsProcessingFile(false)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      // Simulate a file input change event
      handleFileUpload({
        target: { files: [file] },
        currentTarget: { files: [file] },
      } as any)
    }
  }

  const clearFile = () => {
    setUploadedFile(null)
  }

  const analyzeContract = async (analysisType = "comprehensive") => {
    if (!contractText.trim()) return

    setIsAnalyzing(true)
    try {
              const response = await fetch("/api/contracts/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contractText,
          analysisType,
        }),
      })

      const data = await response.json()
      if (data.success) {
        let mockResult: any

        if (analysisType === "issues") {
          mockResult = {
            type: "issues",
            score: Math.floor(Math.random() * 30) + 60, // 60-90
            issues: [
              "Ambiguous termination clause in section 5.2",
              "Missing force majeure provisions",
              "Unclear intellectual property rights",
              "Insufficient liability limitations",
              "Vague payment terms and conditions",
              "Missing dispute resolution mechanism",
            ],
            recommendations: [],
            summary: data.analysis,
          }
        } else if (analysisType === "improvements") {
          mockResult = {
            type: "improvements",
            score: Math.floor(Math.random() * 20) + 80, // 80-100
            issues: [],
            recommendations: [
              "Add specific termination notice period (30 days minimum)",
              "Include comprehensive force majeure clause",
              "Define IP ownership and licensing terms clearly",
              "Add limitation of liability clause",
              "Specify payment schedules and late fees",
              "Include mediation and arbitration clauses",
              "Add confidentiality and non-disclosure terms",
              "Include governing law and jurisdiction",
            ],
            summary: data.analysis,
          }
        } else {
          // Default comprehensive analysis
          mockResult = {
            type: analysisType,
            score: Math.floor(Math.random() * 30) + 70, // 70-100
            issues: [
              "Ambiguous termination clause in section 5.2",
              "Missing force majeure provisions",
              "Unclear intellectual property rights",
            ],
            recommendations: [
              "Add specific termination notice period",
              "Include comprehensive force majeure clause",
              "Define IP ownership and licensing terms",
            ],
            summary: data.analysis,
          }
        }

        setAnalysisResult(mockResult)
        if (analysisType !== "issues" && analysisType !== "improvements") {
          setActiveTab("results")
        }
      }
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Store the original contract before improvement
  const handleImproveContract = async () => {
    if (!contractText.trim()) return;
    setIsImproving(true);
    setOriginalContent(contractText); // Save original before improvement
    try {
      const response = await fetch("/api/contracts/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contractText,
          improvementType: "general",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setImprovedContent(data.improvedContract);
        setActiveTab("improve");
      }
    } catch (error) {
      console.error("Improvement error:", error);
    } finally {
      setIsImproving(false);
    }
  };

  // Download improved contract as .txt
  const handleDownload = () => {
    if (!improvedContent || improvedContent.trim() === "") {
      alert("No improved contract available to download. Please improve the contract first.");
      return;
    }
    const blob = new Blob([improvedContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "improved_contract.txt");
  };

  // Compare original and improved contracts
  const handleCompare = () => {
    if (!improvedContent || improvedContent.trim() === "") {
      alert("No improved contract available to compare. Please improve the contract first.");
      return;
    }
    if (!originalContent || originalContent.trim() === "") {
      alert("No original contract found for comparison.");
      return;
    }
    setShowCompare(true);
  };

  // Simple diff function (line by line)
  const getDiff = (a: string, b: string) => {
    const aLines = a.split("\n");
    const bLines = b.split("\n");
    let diff = [];
    for (let i = 0; i < Math.max(aLines.length, bLines.length); i++) {
      if (aLines[i] !== bLines[i]) {
        diff.push({
          original: aLines[i] || "",
          improved: bLines[i] || "",
        });
      }
    }
    return diff;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBackground = (score: number) => {
    if (score >= 90) return "bg-green-500/20"
    if (score >= 70) return "bg-yellow-500/20"
    return "bg-red-500/20"
  }

  // Filter and search logic
  // const filteredContracts = contracts.filter((contract) => { // This line was removed as per the edit hint
  //   const matchesSearch =
  //     contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     contract.type?.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesFilter = filterStatus === "all" || contract.status === filterStatus;
  //   return matchesSearch && matchesFilter;
  // });
  // const filteredRecent = filteredContracts.slice(0, 3); // This line was removed as per the edit hint
  // const filteredShared = contracts.filter((c) => c.shared).slice(0, 3); // This line was removed as per the edit hint

  // Dropdown navigation
  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSection(e.target.value);
    setTimeout(() => {
      if (e.target.value === "recent" && recentRef.current) recentRef.current.scrollIntoView({ behavior: "smooth" });
      if (e.target.value === "shared" && sharedRef.current) sharedRef.current.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen aramco-gradient">
      {/* Header */}
      <header className="aramco-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-aramco-dark-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Aramco Digital</span>
                <p className="text-xs aramco-text-primary font-medium">AI Contract Suite</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI Contract Suite</h1>
          <p className="text-slate-300">
            Advanced contract analysis and improvement powered by artificial intelligence
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Tools */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-aramco-dark-800 border border-aramco-dark-600">
                <TabsTrigger value="upload" className="data-[state=active]:bg-aramco-green-600">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="analyze" className="data-[state=active]:bg-aramco-green-600">
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </TabsTrigger>
                <TabsTrigger value="results" className="data-[state=active]:bg-aramco-green-600">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Results
                </TabsTrigger>
                <TabsTrigger value="improve" className="data-[state=active]:bg-aramco-green-600">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Improve
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <Card className="aramco-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Contract
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Upload your contract document or paste the text for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-aramco-green-500 transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {isProcessingFile ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 text-aramco-green-400 animate-spin" />
                          <p className="text-white">Processing {uploadedFile?.name}...</p>
                          <p className="text-sm text-slate-400">Extracting text from document</p>
                        </div>
                      ) : uploadedFile ? (
                        <div className="flex flex-col items-center gap-3">
                          <FileText className="w-8 h-8 text-aramco-green-400" />
                          <div className="flex items-center gap-2">
                            <p className="text-white">{uploadedFile.name}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                clearFile()
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-aramco-green-400">✓ File processed successfully</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="w-8 h-8 text-slate-400" />
                          <div>
                            <p className="text-white mb-1">Drop your contract here or click to browse</p>
                            <p className="text-sm text-slate-400">Supports PDF, Word, and text files (Max 25MB)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-slate-400">
                      <span>or</span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Paste Contract Text</label>
                      <Textarea
                        placeholder="Paste your contract text here..."
                        value={contractText}
                        onChange={(e) => setContractText(e.target.value)}
                        className="aramco-input min-h-[200px]"
                      />
                    </div>

                    {contractText && (
                      <Button onClick={() => setActiveTab("analyze")} className="w-full aramco-button-primary">
                        Proceed to Analysis
                        <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analyze" className="mt-6">
                <Card className="aramco-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Search className="w-5 h-5 mr-2" />
                      Contract Analysis
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Choose the type of analysis you want to perform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => analyzeContract("comprehensive")}
                        disabled={!contractText || isAnalyzing}
                        className="h-20 flex flex-col items-center justify-center bg-aramco-blue-600/20 border border-aramco-blue-600/30 text-white hover:bg-aramco-blue-600/30"
                      >
                        <FileCheck className="w-6 h-6 mb-2" />
                        Comprehensive Analysis
                      </Button>

                      <Button
                        onClick={() => analyzeContract("risk")}
                        disabled={!contractText || isAnalyzing}
                        className="h-20 flex flex-col items-center justify-center bg-aramco-red-600/20 border border-red-600/30 text-white hover:bg-red-600/30"
                      >
                        <AlertTriangle className="w-6 h-6 mb-2" />
                        Risk Assessment
                      </Button>

                      <Button
                        onClick={() => analyzeContract("compliance")}
                        disabled={!contractText || isAnalyzing}
                        className="h-20 flex flex-col items-center justify-center bg-aramco-green-600/20 border border-aramco-green-600/30 text-white hover:bg-aramco-green-600/30"
                      >
                        <Shield className="w-6 h-6 mb-2" />
                        Compliance Check
                      </Button>

                      <Button
                        onClick={() => analyzeContract("financial")}
                        disabled={!contractText || isAnalyzing}
                        className="h-20 flex flex-col items-center justify-center bg-yellow-600/20 border border-yellow-600/30 text-white hover:bg-yellow-600/30"
                      >
                        <DollarSign className="w-6 h-6 mb-2" />
                        Financial Analysis
                      </Button>
                    </div>

                    {isAnalyzing && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-aramco-green-400 mx-auto mb-4" />
                          <p className="text-white">Analyzing contract...</p>
                          <p className="text-sm text-slate-400">This may take a few moments</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="mt-6">
                {analysisResult ? (
                  <div className="space-y-6">
                    {/* Analysis Score */}
                    <Card className="aramco-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span className="flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Analysis Score
                          </span>
                          <div className={`text-2xl font-bold ${getScoreColor(analysisResult.score)}`}>
                            {analysisResult.score}/100
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className={`p-4 rounded-lg ${getScoreBackground(analysisResult.score)}`}>
                            <Progress value={analysisResult.score} className="mb-2" />
                            <p className="text-sm text-white">
                              {analysisResult.score >= 90
                                ? "Excellent contract quality"
                                : analysisResult.score >= 70
                                  ? "Good contract with minor improvements needed"
                                  : "Contract requires significant improvements"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Issues Found */}
                    <Card className="aramco-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                          Issues Identified
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysisResult.issues.map((issue: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                            >
                              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <span className="text-white text-sm">{issue}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card className="aramco-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                          Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysisResult.recommendations.map((rec: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg"
                            >
                              <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <span className="text-white text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Analysis */}
                    <Card className="aramco-card">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <FileCheck className="w-5 h-5 mr-2" />
                          Detailed Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{analysisResult.summary}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-4">
                      <Button onClick={handleImproveContract} disabled={isImproving} className="aramco-button-primary flex-1">
                        {isImproving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Improving...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Improve Contract
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setActiveTab("analyze")}
                        variant="outline"
                        className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                      >
                        New Analysis
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Card className="aramco-card">
                    <CardContent className="p-12 text-center">
                      <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Analysis Results</h3>
                      <p className="text-slate-400 mb-6">Upload a contract and run analysis to see results here</p>
                      <Button onClick={() => setActiveTab("upload")} className="aramco-button-primary">
                        Upload Contract
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {activeTab === "improve" && (
                <Card className="aramco-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Improved Contract
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" className="aramco-button-secondary" onClick={handleDownload}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                          onClick={handleCompare}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Compare
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-aramco-dark-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-white whitespace-pre-wrap font-mono">{improvementResult || improvedContent}</pre>
                    </div>
                    <Button onClick={handleImproveContract} disabled={isImproving || !contractText.trim()} className="aramco-button-primary flex-1 mt-4">
                      {isImproving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Improve Contract
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Tabs>
          </div>

          {/* Right Panel - Analysis Tools */}
          <div className="space-y-6">
            {/* Contract Analysis Panel */}
            <Card className="aramco-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  Contract Analysis
                </CardTitle>
                <CardDescription className="text-aramco-dark-300">
                  Identify issues and problems in your contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => analyzeContract("issues")}
                  disabled={!contractText || isAnalyzing}
                  className="w-full bg-red-600/20 border border-red-600/30 text-white hover:bg-red-600/30"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Find Issues
                    </>
                  )}
                </Button>

                {analysisResult && analysisResult.type === "issues" && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-sm font-medium text-red-300">Issues Found:</p>
                    {analysisResult.issues.map((issue: string, index: number) => (
                      <div
                        key={index}
                        className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-white"
                      >
                        • {issue}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contract Improvement Panel */}
            <Card className="aramco-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                  Improvement Suggestions
                </CardTitle>
                <CardDescription className="text-aramco-dark-300">
                  Get AI-powered suggestions to enhance your contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => analyzeContract("improvements")}
                  disabled={!contractText || isAnalyzing}
                  className="w-full bg-yellow-600/20 border border-yellow-600/30 text-white hover:bg-yellow-600/30"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get Suggestions
                    </>
                  )}
                </Button>

                {analysisResult && analysisResult.type === "improvements" && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-sm font-medium text-yellow-300">Suggestions:</p>
                    {analysisResult.recommendations.map((rec: string, index: number) => (
                      <div
                        key={index}
                        className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-white"
                      >
                        • {rec}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="aramco-card">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/templates">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/generator">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Generate New Contract
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Tips */}
            <Card className="aramco-card">
              <CardHeader>
                <CardTitle className="text-white text-lg">AI Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-aramco-green-500/10 border border-aramco-green-500/20 rounded-lg">
                    <p className="text-green-300 font-medium mb-1">💡 Pro Tip</p>
                    <p className="text-slate-300">Upload contracts in plain text format for best analysis results.</p>
                  </div>
                  <div className="p-3 bg-aramco-blue-500/10 border border-aramco-blue-500/20 rounded-lg">
                    <p className="text-blue-300 font-medium mb-1">🔍 Analysis</p>
                    <p className="text-slate-300">Run multiple analysis types to get comprehensive insights.</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-purple-300 font-medium mb-1">📄 PDF Export</p>
                    <p className="text-slate-300">Ask the AI assistant to generate PDF contracts and templates.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dropdown for quick navigation */}
            <div className="flex gap-4 items-center mb-6">
              <select value={section} onChange={handleSectionChange} className="px-4 py-2 rounded bg-aramco-dark-700 text-white">
                <option value="recent">Recent Contracts</option>
                <option value="shared">Shared Contracts</option>
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aramco-dark-400 w-4 h-4" />
                <input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 aramco-input"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-aramco-dark-700 border border-aramco-dark-600 rounded-lg text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Recent Contracts Section */}
            <div ref={recentRef} className="mb-8">
              <h2 className="text-white text-2xl font-bold mb-2">Recent Contracts</h2>
              <div className="space-y-4">
                {/* filteredRecent.length === 0 ? ( // This line was removed as per the edit hint
                  <div className="text-slate-400">No recent contracts found.</div>
                ) : ( */}
                  {/* filteredRecent.map((contract, idx) => ( // This line was removed as per the edit hint
                    <div key={idx} className="bg-aramco-dark-700/30 rounded-xl p-4 border border-aramco-dark-600/50">
                      <h3 className="font-semibold text-white text-lg">{contract.title}</h3>
                      <div className="text-slate-300 text-sm mt-2 line-clamp-2 max-w-md">{contract.content ?? ""}</div>
                    </div>
                  )) */}
                {/* )} */}
              </div>
            </div>

            {/* Shared Contracts Section */}
            <div ref={sharedRef} className="mb-8">
              <h2 className="text-blue-300 text-2xl font-bold mb-2">Shared Contracts</h2>
              <div className="space-y-4">
                {/* filteredShared.length === 0 ? ( // This line was removed as per the edit hint
                  <div className="text-slate-400">No shared contracts found.</div>
                ) : ( */}
                  {/* filteredShared.map((contract, idx) => ( // This line was removed as per the edit hint
                    <div key={idx} className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-aramco-blue-500/20">
                      <h3 className="font-semibold text-white text-lg">{contract.title}</h3>
                      <div className="text-slate-300 text-sm mt-2 line-clamp-2 max-w-md">{contract.content ?? ""}</div>
                    </div>
                  )) */}
                {/* )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
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
              <pre className="bg-aramco-dark-800 p-2 rounded text-xs overflow-x-auto max-h-64">{improvedContent}</pre>
            </div>
          </div>
          <div className="mt-2">
            <span className="font-medium text-white">Changed Lines:</span>
            <ul className="text-xs text-aramco-accent-red list-disc ml-6">
              {getDiff(originalContent, improvedContent).map((d, i) => (
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
    </div>
  )
}
