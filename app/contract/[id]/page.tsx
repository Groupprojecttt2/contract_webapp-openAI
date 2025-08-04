"use client"

import * as React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { ContractAITools } from "@/components/contract-ai-tools"
import { ExportButton } from "@/components/export-button"
import { ChatInterface } from "@/components/chat-interface"
import { ContractQuickActions } from "@/components/contract-quick-actions"
import { RiskAnalysisDashboard } from "@/components/risk-analysis-dashboard"
import { ContractEditor } from "@/components/contract-editor"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  ArrowLeft,
  Edit,
  Share2,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  Brain,
  MessageSquare,
  Search,
  X,
  Lightbulb,
  Zap,
  Info,
  History,
  Bookmark,
} from "lucide-react"
import Link from "next/link"
import { app } from "@/lib/firebaseClient";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Contract {
  title: string;
  type?: string;
  status?: string;
  parties?: any[];
  terms?: any;
  content: string;
  highlights?: any[];
  userHighlights?: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
    color: string;
    note?: string;
    type: 'important' | 'warning' | 'info' | 'custom';
    userId?: string;
    username?: string;
    createdAt?: Date;
  }>;
  previousContent?: string; // Added for diff
  [key: string]: any;
}

export default function ContractViewPage({ params }: { params: Promise<{ id: string }> }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [showAITools, setShowAITools] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedText, setHighlightedText] = useState("")
  const [aiExplanation, setAiExplanation] = useState("")
  const [isExplaining, setIsExplaining] = useState(false)
  const [explanationPosition, setExplanationPosition] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const searchParams = useSearchParams()

  const [contractData, setContractData] = useState<Contract | null>(null)
  const [originalContractData, setOriginalContractData] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<"read" | "edit">("read");
  const [sharing, setSharing] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<"owner" | "edit" | "read">("owner");
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffLines, setDiffLines] = useState<number[]>([]);
  const [changeLog, setChangeLog] = useState<any[]>([]);
  const [selectedChangeUser, setSelectedChangeUser] = useState<string | null>(null);
  const [selectedChangeDiff, setSelectedChangeDiff] = useState<{ prev: string, curr: string, timestamp: string, username: string } | null>(null);
  const [showChangeHistory, setShowChangeHistory] = useState(true);
  const [userHighlights, setUserHighlights] = useState<Array<{
    id: string;
    start: number;
    end: number;
    text: string;
    color: string;
    note?: string;
    type: 'important' | 'warning' | 'info' | 'custom';
    userId?: string;
    username?: string;
    createdAt?: Date;
  }>>([]);

  // Highlight color constants
  const HIGHLIGHT_COLORS = {
    important: 'bg-yellow-300 text-yellow-900 border-yellow-400',
    warning: 'bg-red-300 text-red-900 border-red-400',
    info: 'bg-blue-300 text-blue-900 border-blue-400',
    custom: 'bg-green-300 text-green-900 border-green-400',
  }

  const HIGHLIGHT_COLORS_BG = {
    important: 'bg-yellow-200',
    warning: 'bg-red-200',
    info: 'bg-blue-200',
    custom: 'bg-green-200',
  }

  const HIGHLIGHT_COLORS_BORDER = {
    important: 'border-yellow-300',
    warning: 'border-red-300',
    info: 'border-blue-300',
    custom: 'border-green-300',
  }

  const unwrappedParams = React.use(params);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setCurrentUserId(user.uid);
        // Fetch username/email for lastEditedBy
        const db = getFirestore(app);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        setCurrentUserName(userData?.username || userData?.email || user.email || user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchContract = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const contractRef = doc(db, "contracts", unwrappedParams.id);
      const contractSnap = await getDoc(contractRef);
      if (contractSnap.exists()) {
        const contractData = contractSnap.data() as Contract;
        setContractData(contractData);
        setOriginalContractData(JSON.parse(JSON.stringify(contractData)) as Contract);
        setUserHighlights(contractData.userHighlights || []);
      } else {
        setContractData(null);
      }
      setLoading(false);
    };
    fetchContract();
  }, [unwrappedParams.id]);

  // Save contract to Firestore
  const saveContractToFirestore = async (updatedContract: Contract) => {
    const db = getFirestore(app);
    let updateFields: any = {
      ...updatedContract,
      updated_at: new Date().toISOString(),
    };
    // If the current user is not the owner but has edit permission, set lastEditedBy and lastEditedAt, save previousContent, and always append to changeLog
    if (permissionLevel === "edit" && currentUserId && contractData?.user_id !== currentUserId) {
      updateFields.lastEditedBy = currentUserName || currentUserId;
      updateFields.lastEditedAt = new Date().toISOString();
      updateFields.previousContent = contractData?.content || "";
      // Always append a new changeLog entry for every edit
      const newChange = {
        userId: currentUserId,
        username: currentUserName || currentUserId,
        timestamp: new Date().toISOString(),
        previousContent: contractData?.content || "",
        newContent: updatedContract.content,
      };
      updateFields.changeLog = [...(contractData?.changeLog || []), newChange];
    }
    await setDoc(doc(db, "contracts", unwrappedParams.id), updateFields, { merge: true });
  };

  const handleContractUpdate = (updatedContent: string) => {
    if (!contractData) return;
    const updatedContract = { ...contractData, content: updatedContent, userHighlights };
    setContractData(updatedContract);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`contract_${unwrappedParams.id}`, JSON.stringify(updatedContract));
    }
    // Save to Firestore
    saveContractToFirestore(updatedContract);
  }

  const handleHighlightsChange = (newHighlights: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
    color: string;
    note?: string;
    type: 'important' | 'warning' | 'info' | 'custom';
    userId?: string;
    username?: string;
    createdAt?: Date;
  }>) => {
    setUserHighlights(newHighlights);
    if (contractData) {
      const updatedContract = { ...contractData, userHighlights: newHighlights };
      setContractData(updatedContract);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`contract_${unwrappedParams.id}`, JSON.stringify(updatedContract));
      }
      // Save to Firestore
      saveContractToFirestore(updatedContract);
    }
  }

  const handleResetContract = () => {
    if (!originalContractData) return;
    setContractData(originalContractData);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`contract_${unwrappedParams.id}`, JSON.stringify(originalContractData));
    }
  }

  const handleTextSelection = async (event: React.MouseEvent) => {
    if (typeof window !== 'undefined') {
      const selection = window.getSelection()
      if (selection && selection.toString().trim().length > 0) {
        const selectedText = selection.toString().trim()
        setHighlightedText(selectedText)
        setExplanationPosition({ x: event.clientX, y: event.clientY })

        // Get AI explanation for the selected text
        setIsExplaining(true)
        try {
          const response = await fetch("/api/contracts/explain-text", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              selectedText,
              contractContent: contractData?.content,
            }),
          })

          const data = await response.json()
          if (data.success) {
            setAiExplanation(data.explanation)
          } else {
            setAiExplanation("Unable to explain this text at the moment.")
          }
        } catch (error) {
          console.error("Explanation error:", error)
          setAiExplanation("Error getting explanation. Please try again.")
        } finally {
          setIsExplaining(false)
        }
      }
    }
  }

  const clearSelection = () => {
    setHighlightedText("")
    setAiExplanation("")
    if (typeof window !== 'undefined') {
      window.getSelection()?.removeAllRanges()
    }
  }

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-300 text-black px-1 rounded">$1</mark>')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-500/20 border-l-4 border-yellow-500"
      case "review":
        return "bg-blue-100 dark:bg-blue-500/20 border-l-4 border-blue-200 dark:border-blue-500"
      case "approved":
        return "bg-green-500/20 border-l-4 border-green-500"
      case "signed":
        return "bg-purple-500/20 border-l-4 border-purple-500"
      default:
        return "bg-gray-500/20 border-l-4 border-gray-500"
    }
  }

  const getHighlightColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-500/20 border-l-4 border-red-500"
      case "financial":
        return "bg-green-500/20 border-l-4 border-green-500"
      case "timeline":
        return "bg-blue-100 dark:bg-blue-500/20 border-l-4 border-blue-200 dark:border-blue-500"
      case "risk":
        return "bg-yellow-500/20 border-l-4 border-yellow-500"
      default:
        return "bg-slate-500/20 border-l-4 border-slate-500"
    }
  }

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case "financial":
        return <DollarSign className="w-4 h-4 text-green-400" />
      case "timeline":
        return <Calendar className="w-4 h-4 text-blue-400" />
      case "risk":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      default:
        return <CheckCircle className="w-4 h-4 text-slate-400" />
    }
  }

  // Fetch all users for sharing
  useEffect(() => {
    if (!showShareDialog) return;
    const fetchUsers = async () => {
      const db = getFirestore(app);
      const usersSnap = await (await import("firebase/firestore")).getDocs(
        (await import("firebase/firestore")).collection(db, "users")
      );
      const users = usersSnap.docs.map(doc => doc.data());
      setAllUsers(users);
    };
    fetchUsers();
  }, [showShareDialog]);

  // Fetch shared users from contractData
  useEffect(() => {
    if (!contractData) return;
    setSharedUsers(contractData.sharedWith || []);
  }, [contractData]);

  // Fetch changeLog from contractData
  useEffect(() => {
    if (contractData?.changeLog) {
      setChangeLog(contractData.changeLog);
    } else {
      setChangeLog([]);
    }
  }, [contractData]);

  // Add or update sharing for a user
  const handleShare = async () => {
    if (!selectedUser || !contractData) return;
    setSharing(true);
    try {
      const db = getFirestore(app);
      // Update Firestore: add or update sharedWith array
      const updatedShared = [
        ...(contractData.sharedWith || []).filter((u: any) => u.userId !== selectedUser.id),
        { userId: selectedUser.id, username: selectedUser.username, email: selectedUser.email, permission: selectedPermission },
      ];
      await setDoc(doc(db, "contracts", unwrappedParams.id), { sharedWith: updatedShared }, { merge: true });
      setContractData({ ...contractData, sharedWith: updatedShared });
      setSharedUsers(updatedShared);
      setSelectedUser(null);
      toast.success(`Shared with ${selectedUser.username} as ${selectedPermission}`);
    } catch (e) {
      toast.error("Failed to share contract");
    }
    setSharing(false);
  };

  // Remove a user from sharing
  const handleRemoveShare = async (userId: string) => {
    if (!contractData) return;
    const db = getFirestore(app);
    const updatedShared = (contractData.sharedWith || []).filter((u: any) => u.userId !== userId);
    await setDoc(doc(db, "contracts", unwrappedParams.id), { sharedWith: updatedShared }, { merge: true });
    setContractData({ ...contractData, sharedWith: updatedShared });
    setSharedUsers(updatedShared);
    toast.success("Removed user from shared list");
  };

  // Get current user ID and determine permission
  useEffect(() => {
    if (contractData) {
      if (contractData.user_id === currentUserId) {
        setPermissionLevel("owner");
      } else if (Array.isArray(contractData.sharedWith)) {
        const shared = contractData.sharedWith.find((u: any) => u.userId === currentUserId);
        if (shared) setPermissionLevel(shared.permission);
        else setPermissionLevel("read");
      } else {
        setPermissionLevel("read");
      }
    }
  }, [contractData, currentUserId]);

  // Diff logic: compare previousContent and current content, return changed line numbers
  function getChangedLines(prev: string, curr: string): number[] {
    const prevLines = prev.split("\n");
    const currLines = curr.split("\n");
    const changed: number[] = [];
    const maxLen = Math.max(prevLines.length, currLines.length);
    for (let i = 0; i < maxLen; i++) {
      if (prevLines[i] !== currLines[i]) {
        changed.push(i);
      }
    }
    return changed;
  }

  // When showDiff is toggled, compute diff lines
  useEffect(() => {
    if (showDiff && contractData?.previousContent && contractData?.content) {
      setDiffLines(getChangedLines(contractData.previousContent, contractData.content));
    } else {
      setDiffLines([]);
    }
  }, [showDiff, contractData]);

  if (loading) {
    return (
      <div className="min-h-screen aramco-gradient flex items-center justify-center">
        <div className="text-white">Loading contract...</div>
      </div>
    )
  }

  if (!contractData) {
    return (
      <div className="min-h-screen aramco-gradient flex items-center justify-center">
        <div className="text-white">Contract not found</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aramco-gradient flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (showChat) {
    return (
      <div className="h-screen flex flex-col aramco-gradient">
        {/* Header */}
        <header className="aramco-header flex-shrink-0">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="text-white hover:bg-aramco-dark-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Contract
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">ContractForge</span>
                  <p className="text-xs aramco-text-primary font-medium">Contract Chat</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface contractContent={contractData.content} contractId={unwrappedParams.id} />
        </div>
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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">ContractForge</span>
                <p className="text-xs aramco-text-primary font-medium">Contract View</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Banner for read-only access */}
            {permissionLevel === "read" && (
              <div className="mb-4 p-3 bg-yellow-700/30 border border-yellow-600 text-yellow-200 rounded text-center font-semibold">
                You have <span className="font-bold">Read Only</span> access to this contract. Editing features are disabled.
              </div>
            )}
            {/* Only show quick actions, AI tools, edit, and share if owner or edit */}
            {(permissionLevel === "owner" || permissionLevel === "edit") && (
              <Button
                onClick={() => setShowQuickActions(!showQuickActions)}
                variant="outline"
                className="bg-transparent border-aramco-green-500 text-aramco-green-400 hover:bg-aramco-green-500/10"
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Actions
              </Button>
            )}
            {(permissionLevel === "owner" || permissionLevel === "edit") && (
              <Button
                onClick={() => setShowAITools(!showAITools)}
                variant="outline"
                className="bg-transparent border-aramco-blue-500 text-aramco-blue-400 hover:bg-aramco-blue-500/10"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Tools
              </Button>
            )}
            <Button
              onClick={() => setShowRiskAnalysis(!showRiskAnalysis)}
              variant="outline"
              className="bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Risk Analysis
            </Button>
            {permissionLevel === "owner" && (
              <Button
                variant="outline"
                className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            {(permissionLevel === "owner" || permissionLevel === "edit") && (
              <Button
                variant="outline"
                className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {(permissionLevel === "owner" || permissionLevel === "edit") && (
              <ExportButton
                contractId={unwrappedParams.id}
                contractTitle={contractData.title}
                contractContent={contractData.content}
              />
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isGenerated && (
          <div className="mb-6 p-4 bg-gradient-to-r from-aramco-green-500/20 to-aramco-blue-500/20 border border-aramco-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-aramco-green-300">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Contract Generated Successfully with AI!</span>
            </div>
            <p className="text-aramco-green-200 text-sm mt-1">
              Your AI-generated contract is ready for review. Important sections have been highlighted below. Use AI
              Tools for further analysis or chat with the AI assistant.
            </p>
          </div>
        )}

        {/* Show update banner for owner if lastEditedBy is set and not the owner, with Show Changes icon */}
        {permissionLevel === "owner" && contractData?.lastEditedBy && contractData?.lastEditedBy !== currentUserName && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/80 border border-blue-200 dark:border-blue-500/40 shadow-lg animate-glow">
            <Info className="w-6 h-6 text-blue-300" />
            <div className="flex-1">
              <span className="text-blue-200 font-semibold">This contract was updated by </span>
              <span className="text-white font-bold">{contractData.lastEditedBy}</span>
              <span className="text-blue-200 font-semibold"> on </span>
              <span className="text-blue-100">{contractData.lastEditedAt ? new Date(contractData.lastEditedAt).toLocaleString() : "unknown time"}</span>
            </div>
            {contractData.previousContent && (
              <button
                className={`ml-4 flex items-center gap-1 px-3 py-1 rounded bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-600 transition font-semibold ${showDiff ? "ring-2 ring-blue-300" : ""}`}
                onClick={() => setShowDiff(v => !v)}
                title={showDiff ? "Hide changes" : "Show changes"}
              >
                <History className="w-5 h-5" /> {showDiff ? "Hide Changes" : "Show Changes"}
              </button>
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className={`${showAITools || showQuickActions || showRiskAnalysis ? "lg:col-span-2" : "lg:col-span-3"} space-y-6`}>
            {/* Contract Header */}
            <Card className="aramco-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl mb-2">{contractData.title}</CardTitle>
                    <div className="flex items-center gap-3">
                      <Badge className="aramco-accent-blue">{contractData.type}</Badge>
                      <Badge className="aramco-accent-yellow">{contractData.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-400">
                    <p>Contract ID: {unwrappedParams.id}</p>
                    <p>Generated: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Search Bar */}
            <Card className="aramco-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-aramco-dark-400" />
                    <Input
                      placeholder="Search for specific words or phrases in the contract..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 aramco-input"
                    />
                    {searchTerm && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-aramco-dark-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {searchTerm && (
                    <Badge className="aramco-accent-green">
                      {
                        (
                          contractData.content.match(
                            new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"),
                          ) || []
                        ).length
                      }{" "}
                      matches
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contract Editor */}
            <ContractEditor
              content={contractData.content}
              onContentChange={handleContractUpdate}
              highlights={userHighlights}
              onHighlightsChange={handleHighlightsChange}
              isReadOnly={permissionLevel === "read"}
              contractId={unwrappedParams.id}
              currentUserId={currentUserId || undefined}
              currentUserName={currentUserName || undefined}
            />

            {/* Risk Analysis */}
            {showRiskAnalysis && (
              <RiskAnalysisDashboard 
                contractContent={contractData.content}
                industry={contractData.type?.toLowerCase() || "general"}
                contractType={contractData.type || "general"}
              />
            )}

            {/* Key Highlights */}
            {contractData.highlights && contractData.highlights.length > 0 && (
              <Card className="aramco-card">
                <CardHeader>
                  <CardTitle className="text-white">AI-Generated Key Highlights & Important Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contractData.highlights.map((highlight, index) => (
                    <div key={index} className={`p-4 rounded-lg ${getHighlightColor(highlight.type)}`}>
                      <div className="flex items-start gap-3">
                        {getHighlightIcon(highlight.type)}
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">"{highlight.text}"</p>
                          <p className="text-slate-300 text-sm">{highlight.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions Sidebar */}
          {showQuickActions && (permissionLevel === "owner" || permissionLevel === "edit") && (
            <div className="lg:col-span-1">
              <ContractQuickActions
                contractContent={contractData.content}
                contractId={unwrappedParams.id}
                onContractUpdate={handleContractUpdate}
                onReset={handleResetContract}
              />
            </div>
          )}

          {/* AI Tools Sidebar */}
          {showAITools && (permissionLevel === "owner" || permissionLevel === "edit") && (
            <div className="lg:col-span-1">
              <ContractAITools contractContent={contractData.content} contractId={unwrappedParams.id} />
            </div>
          )}

          {/* Regular Sidebar */}
          <div className={`${showAITools || showQuickActions || showRiskAnalysis ? "lg:col-span-1" : "lg:col-span-1"} space-y-6`}>
            {/* Contract Parties */}
            <Card className="aramco-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Contract Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contractData.parties?.map((party, index) => (
                  <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                    <h4 className="font-semibold text-white mb-1">{party.name}</h4>
                    <p className="text-sm text-blue-300 mb-2">{party.role}</p>
                    <p className="text-xs text-slate-400">{party.type}</p>
                    <p className="text-xs text-slate-400 mt-1">{party.address}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Highlights & Annotations */}
            <Card className="aramco-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bookmark className="w-5 h-5" />
                  Highlights & Annotations ({userHighlights.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userHighlights.length === 0 ? (
                  <div className="text-center py-4">
                    <Bookmark className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    <p className="text-slate-400 text-sm">No highlights yet</p>
                    <p className="text-slate-500 text-xs">Select text in the contract to add highlights</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userHighlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className={`p-3 rounded-lg border-2 ${HIGHLIGHT_COLORS_BG[highlight.type]} ${HIGHLIGHT_COLORS_BORDER[highlight.type]}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs font-bold ${HIGHLIGHT_COLORS[highlight.type]}`}>
                              {highlight.type.charAt(0).toUpperCase() + highlight.type.slice(1)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <div className="w-4 h-4 rounded-full bg-aramco-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                {highlight.username?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <span className="text-xs text-slate-300 font-medium">
                                {highlight.username || 'Unknown User'}
                              </span>
                            </div>
                          </div>
                          {permissionLevel !== "read" && (
                            <Button
                              onClick={() => {
                                const updatedHighlights = userHighlights.filter(h => h.id !== highlight.id)
                                handleHighlightsChange(updatedHighlights)
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100 h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs font-medium mb-1 text-foreground leading-tight">"{highlight.text}"</p>
                        {highlight.note && (
                          <p className="text-xs text-muted-foreground italic mt-1">
                            <MessageSquare className="w-3 h-3 inline mr-1" />
                            {highlight.note}
                          </p>
                        )}
                        {highlight.createdAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(highlight.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="aramco-card">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => setShowQuickActions(!showQuickActions)} className="w-full aramco-button-primary">
                  <Zap className="w-4 h-4 mr-2" />
                  {showQuickActions ? "Hide" : "Show"} Quick Actions
                </Button>
                <Button onClick={() => setShowRiskAnalysis(!showRiskAnalysis)} className="w-full bg-red-600 hover:bg-red-700 text-white">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {showRiskAnalysis ? "Hide" : "Show"} Risk Analysis
                </Button>
                <Button onClick={() => setShowChat(true)} className="w-full aramco-button-secondary">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with AI
                </Button>
                {(permissionLevel === "owner" || permissionLevel === "edit") && (
                  <ExportButton
                    contractId={unwrappedParams.id}
                    contractTitle={contractData.title}
                    contractContent={contractData.content}
                  />
                )}
                <p className="text-xs text-aramco-dark-400 mt-2">
                  Use Quick Actions for instant edits, or AI chat for detailed analysis
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share this Contract</DialogTitle>
            <DialogDescription>
              Grant read or edit access to other users. Only the owner can manage sharing.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              className="w-full p-2 rounded border border-slate-600 bg-slate-800 text-white mb-2"
            />
            <div className="max-h-40 overflow-y-auto">
              {allUsers
                .filter(u =>
                  (u.username + u.email).toLowerCase().includes(userSearch.toLowerCase()) &&
                  !sharedUsers.some(su => su.userId === u.id)
                )
                .map((u, idx) => (
                  <div
                    key={u.id || u.email || idx}
                    className={`flex items-center justify-between p-2 rounded hover:bg-slate-700 cursor-pointer ${selectedUser?.id === u.id ? "bg-slate-700" : ""}`}
                    onClick={() => setSelectedUser(u)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-aramco-blue-500 flex items-center justify-center text-white font-bold">
                        {u.username?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-white">{u.username}</div>
                        <div className="text-xs text-slate-300">{u.email}</div>
                      </div>
                    </div>
                    {selectedUser?.id === u.id && <span className="text-aramco-green-400 font-bold">Selected</span>}
                  </div>
                ))}
              {allUsers.filter(u => (u.username + u.email).toLowerCase().includes(userSearch.toLowerCase()) && !sharedUsers.some(su => su.userId === u.id)).length === 0 && (
                <div className="text-slate-400 text-center py-2">No users found</div>
              )}
            </div>
            {selectedUser && (
              <div className="flex items-center gap-2 mt-3">
                <select
                  value={selectedPermission}
                  onChange={e => setSelectedPermission(e.target.value as "read" | "edit")}
                  className="p-2 rounded border border-slate-600 bg-slate-800 text-white"
                >
                  <option value="read">Read Only</option>
                  <option value="edit">Can Edit</option>
                </select>
                <Button onClick={handleShare} disabled={sharing} className="aramco-button-primary">
                  {sharing ? "Sharing..." : "Share"}
                </Button>
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-white mb-2">Already Shared With:</div>
            <div className="space-y-2">
              {sharedUsers.length === 0 && <div className="text-slate-400">No users have access yet.</div>}
              {sharedUsers.map(u => (
                <div key={u.userId} className="flex items-center justify-between p-2 rounded bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-aramco-green-500 flex items-center justify-center text-white font-bold">
                      {u.username?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-white">{u.username}</div>
                      <div className="text-xs text-slate-300">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${u.permission === "edit" ? "bg-aramco-green-600 text-white" : "bg-slate-600 text-slate-200"}`}>
                      {u.permission === "edit" ? "Can Edit" : "Read Only"}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-white"
                      onClick={() => handleRemoveShare(u.userId)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Collaborators section: show if contract is shared with others */}
      {contractData?.sharedWith && contractData.sharedWith.length > 0 && (
        <Card className="aramco-card border-blue-500/40 mt-8">
          <CardHeader>
            <CardTitle className="text-blue-300 text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5" /> Collaborators on this contract
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contractData.sharedWith.map((u: any) => (
              <div key={u.userId} className="flex items-center gap-3 p-2 rounded bg-blue-50 dark:bg-blue-900/40">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-700 flex items-center justify-center text-blue-700 dark:text-white font-bold">
                  {u.username?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{u.username}</div>
                  <div className="text-xs text-blue-200">{u.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${u.permission === "edit" ? "bg-aramco-green-600 text-white" : "bg-slate-600 text-slate-200"}`}>
                  {u.permission === "edit" ? "Can Edit" : "Read Only"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {permissionLevel === "owner" && changeLog.length > 0 && (
        <div className="flex items-center gap-2 mt-8 mb-2">
          <button
            className={`px-3 py-1 rounded font-semibold flex items-center gap-2 transition ${showChangeHistory ? "bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-600" : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-blue-100"}`}
            onClick={() => setShowChangeHistory(v => !v)}
            title={showChangeHistory ? "Hide Change History" : "Show Change History"}
          >
            <History className="w-5 h-5" /> {showChangeHistory ? "Hide Change History" : "Show Change History"}
          </button>
        </div>
      )}
      {permissionLevel === "owner" && changeLog.length > 0 && showChangeHistory && (
        <Card className="aramco-card border-blue-500/40 mt-2">
          <CardHeader>
            <CardTitle className="text-blue-300 text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5" /> Change History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="mb-2 text-blue-200 text-sm">Select a change to view its diff:</div>
            <div className="flex flex-col gap-2 mb-4">
              {[...changeLog].reverse().map((entry, idx) => (
                <button
                  key={entry.timestamp + entry.userId + idx}
                  className={`px-3 py-1 rounded bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-600 font-semibold flex items-center gap-2 ${selectedChangeUser === entry.userId && selectedChangeDiff?.timestamp === entry.timestamp ? "ring-2 ring-blue-300" : ""}`}
                  onClick={() => {
                    setSelectedChangeUser(entry.userId);
                    setSelectedChangeDiff({ prev: entry.previousContent, curr: entry.newContent, timestamp: entry.timestamp, username: entry.username });
                  }}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-white font-bold">
                    {entry.username?.[0]?.toUpperCase()}
                  </div>
                  <span>{entry.username}</span>
                  <span className="text-xs text-blue-200 ml-2">{new Date(entry.timestamp).toLocaleString()}</span>
                </button>
              ))}
            </div>
            {selectedChangeDiff && (
              <div className="mt-4">
                <div className="mb-2 text-blue-100 font-semibold">Changes by {selectedChangeDiff.username} on {new Date(selectedChangeDiff.timestamp).toLocaleString()}:</div>
                <div className="bg-white p-4 rounded-lg text-black font-mono text-sm leading-relaxed max-h-[300px] overflow-y-auto">
                  {getChangedLines(selectedChangeDiff.prev, selectedChangeDiff.curr).length > 0 ?
                    selectedChangeDiff.curr.split("\n").map((line, idx) => (
                      <div
                        key={idx}
                        className={getChangedLines(selectedChangeDiff.prev, selectedChangeDiff.curr).includes(idx) ? "bg-yellow-200 text-black px-1 rounded transition" : undefined}
                        style={{ display: "block" }}
                      >
                        {line}
                      </div>
                    )) : <div className="text-slate-400">No changes detected.</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
