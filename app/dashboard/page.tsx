"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
  Eye,
  Edit,
  Settings,
  User,
  LogOut,
  Sparkles,
  Trash,
  Users,
} from "lucide-react"
import Link from "next/link"
import { AIChatBar } from "@/components/ai-chat-bar"
import { app } from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const [contracts, setContracts] = useState<any[]>([])
  const [sharedContracts, setSharedContracts] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const recentRef = useRef<HTMLDivElement>(null);
  const sharedRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState("recent");
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllShared, setShowAllShared] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      setIsAuthenticated(true);
      setCurrentUserId(user.uid);
      // Fetch username from users collection
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      setUserName(userData?.username || userData?.email || user.displayName || user.email || "User");
      // Fetch contracts for this user
      const contractsQuery = query(collection(db, "contracts"), where("user_id", "==", user.uid));
      const contractsSnapshot = await getDocs(contractsQuery);
      const contractsData = contractsSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "Untitled",
          type: data.type || "",
          status: data.status || "draft",
          createdAt: data.createdAt || data.created_at || new Date().toISOString(),
          lastModified: data.lastModified || data.updated_at || new Date().toISOString(),
          progress: data.progress || 0,
          sharedWith: data.sharedWith || [],
          content: data.content || "",
          user_id: data.user_id || "",
        };
      });
      setContracts(contractsData);
      // Fetch contracts shared with this user
      const allContractsSnapshot = await getDocs(collection(db, "contracts"));
      const shared = allContractsSnapshot.docs
        .map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || "Untitled",
            type: data.type || "",
            status: data.status || "draft",
            createdAt: data.createdAt || data.created_at || new Date().toISOString(),
            lastModified: data.lastModified || data.updated_at || new Date().toISOString(),
            progress: data.progress || 0,
            sharedWith: data.sharedWith || [],
            content: data.content || "",
            user_id: data.user_id || "",
          };
        })
        .filter(contract => Array.isArray(contract.sharedWith) && contract.sharedWith?.some((u: any) => u.userId === user.uid));
      setSharedContracts(shared);
    });
    return () => unsubscribe();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "review":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "approved":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "signed":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit className="w-4 h-4" />
      case "review":
        return <Clock className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "signed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  // Compute dynamic stats
  const totalContracts = contracts.length;
  const inProgressContracts = contracts.filter(c => c.status === "draft" || c.status === "review").length;
  const completedContracts = contracts.filter(c => c.status === "approved" || c.status === "signed").length;

  // Filter and search logic
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  const filteredRecent = showAllRecent ? filteredContracts : filteredContracts.slice(0, 3);
  const filteredShared = showAllShared ? sharedContracts.filter((contract) => {
    const matchesSearch =
      contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  }) : sharedContracts.filter((contract) => {
    const matchesSearch =
      contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  }).slice(0, 3);

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
    <div className="min-h-screen aramco-gradient relative">
      {/* Particle Background */}
      <div className="aramco-particles"></div>

      {/* Header */}
      <header className="aramco-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center shadow-2xl aramco-icon-glow">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white animate-glow">Aramco Digital</span>
              <p className="text-sm aramco-text-primary font-medium">Contract Generator</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User className="w-5 h-5 aramco-icon-glow" />
              <span className="text-sm font-medium">{userName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-black/20 hover:text-aramco-green-400 transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.clear()
                router.push("/")
              }}
              className="text-white hover:bg-black/20 hover:text-red-400 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 animate-glow">Welcome back, {userName}!</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Manage your contracts and generate new ones with AI assistance
          </p>
          <div className="flex items-center justify-center mt-4">
            <Sparkles className="w-6 h-6 text-aramco-green-400 mr-2 animate-pulse" />
            <span className="text-aramco-green-400 font-medium">Powered by Advanced AI Technology</span>
          </div>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="aramco-stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-2 font-medium">Total Contracts</p>
                  <p className="text-3xl font-bold text-white mb-1">{totalContracts}</p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center aramco-accent-blue">
                  <FileText className="w-6 h-6 aramco-icon-glow" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aramco-stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-2 font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-white mb-1">{inProgressContracts}</p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center aramco-accent-yellow">
                  <Clock className="w-6 h-6 aramco-icon-glow" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aramco-stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-2 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-white mb-1">{completedContracts}</p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center aramco-accent-green">
                  <CheckCircle className="w-6 h-6 aramco-icon-glow" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aramco-stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-2 font-medium">Shared Contracts</p>
                  <p className="text-3xl font-bold text-white mb-1">{sharedContracts.length}</p>
                </div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center aramco-accent-blue">
                  <Users className="w-6 h-6 aramco-icon-glow" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <Link href="/generator">
            <Card className="aramco-action-card cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 aramco-icon-glow">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-aramco-green-400 transition-colors">
                  Generate New Contract
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Create contracts using AI-powered templates
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/templates">
            <Card className="aramco-action-card cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-aramco-blue-500 to-aramco-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 aramco-icon-glow">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-aramco-blue-400 transition-colors">
                  Browse Templates
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Explore our comprehensive template library
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/contract-suite">
            <Card className="aramco-action-card cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 aramco-icon-glow">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-aramco-green-400 transition-colors">
                  AI Contract Suite
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Advanced analysis and improvement tools
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

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
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="signed">Signed</option>
          </select>
        </div>

        {/* Recent Contracts Section */}
        <div ref={recentRef} className="mb-8">
          <Card className="aramco-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-2xl font-bold">Recent Contracts</CardTitle>
                  <CardDescription className="text-slate-400 text-lg">Your latest contract activities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecent.length === 0 && (
                  <div className="text-slate-400 text-center">No contracts found. Create your first contract!</div>
                )}
                {filteredRecent.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-6 bg-black/30 rounded-xl border border-aramco-green-500/20 hover:bg-black/50 hover:border-aramco-green-500/40 transition-all duration-300 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-aramco-blue-600/30 rounded-xl flex items-center justify-center group-hover:bg-aramco-blue-600/50 transition-colors">
                        <FileText className="w-6 h-6 text-aramco-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-lg group-hover:text-aramco-green-400 transition-colors flex items-center gap-2">
                          {contract.title}
                          {contract.sharedWith && contract.sharedWith.length > 0 && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-blue-700 text-blue-200 text-xs font-semibold flex items-center gap-1">
                              <Users className="w-4 h-4 inline-block" /> Shared
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-slate-400">
                            Created {new Date(contract.createdAt).toLocaleDateString()}
                          </span>
                          <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
                        </div>
                        <div className="text-slate-300 text-sm mt-2 line-clamp-2 max-w-md">
                          {contract.content ?? ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={async () => {
                          const db = getFirestore(app);
                          // Toggle between 'approved' and 'draft' for completion
                          const newStatus = contract.status === "approved" || contract.status === "signed" ? "draft" : "approved";
                          await setDoc(doc(db, "contracts", contract.id), {
                            status: newStatus,
                            updated_at: new Date().toISOString(),
                          }, { merge: true });
                          // Refresh contracts list
                          const contractsQuery = query(collection(db, "contracts"), where("user_id", "==", contract.user_id));
                          const contractsSnapshot = await getDocs(contractsQuery);
                          const contractsData = contractsSnapshot.docs.map(docSnap => {
                            const data = docSnap.data();
                            return {
                              id: docSnap.id,
                              title: data.title || "Untitled",
                              type: data.type || "",
                              status: data.status || "draft",
                              createdAt: data.createdAt || data.created_at || new Date().toISOString(),
                              lastModified: data.lastModified || data.updated_at || new Date().toISOString(),
                              progress: data.progress || 0,
                              sharedWith: data.sharedWith || [],
                              content: data.content || "",
                              user_id: data.user_id || "",
                            };
                          });
                          setContracts(contractsData);
                        }}
                      >
                        {contract.status === "approved" || contract.status === "signed" ? "Mark In Progress" : "Mark Complete"}
                      </Button>
                      <select
                        value={contract.status}
                        onChange={async (e) => {
                          const db = getFirestore(app);
                          const newStatus = e.target.value;
                          await setDoc(doc(db, "contracts", contract.id), {
                            status: newStatus,
                            updated_at: new Date().toISOString(),
                          }, { merge: true });
                          // Refresh contracts list
                          const contractsQuery = query(collection(db, "contracts"), where("user_id", "==", contract.user_id));
                          const contractsSnapshot = await getDocs(contractsQuery);
                          const contractsData = contractsSnapshot.docs.map(docSnap => {
                            const data = docSnap.data();
                            return {
                              id: docSnap.id,
                              title: data.title || "Untitled",
                              type: data.type || "",
                              status: data.status || "draft",
                              createdAt: data.createdAt || data.created_at || new Date().toISOString(),
                              lastModified: data.lastModified || data.updated_at || new Date().toISOString(),
                              progress: data.progress || 0,
                              sharedWith: data.sharedWith || [],
                              content: data.content || "",
                              user_id: data.user_id || "",
                            };
                          });
                          setContracts(contractsData);
                        }}
                        className="ml-2 px-2 py-1 rounded bg-aramco-dark-700 text-white border border-aramco-dark-600 text-xs"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Review</option>
                        <option value="approved">Approved</option>
                        <option value="signed">Signed</option>
                      </select>
                      <Link href={`/contract/${contract.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-aramco-green-400 hover:text-white hover:bg-aramco-green-500/20 h-10 w-10 p-0 transition-all duration-300"
                        >
                          <Eye className="w-5 h-5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-white hover:bg-red-500/20 h-10 w-10 p-0 transition-all duration-300"
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete the contract "${contract.title}"? This action cannot be undone.`)) {
                            const db = getFirestore(app);
                            await (await import("firebase/firestore")).deleteDoc(doc(db, "contracts", contract.id));
                            setContracts(contracts.filter(c => c.id !== contract.id));
                          }
                        }}
                        aria-label="Delete contract"
                      >
                        <Trash className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredContracts.length > 3 && (
                  <button
                    className="text-aramco-green-400 underline mt-2"
                    onClick={() => setShowAllRecent((prev) => !prev)}
                  >
                    {showAllRecent ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shared Contracts Section */}
        <div ref={sharedRef} className="mb-8">
          {filteredShared.length > 0 && (
            <Card className="aramco-card border-aramco-blue-500/40 mt-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-blue-300 text-2xl font-bold">Shared Contracts</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">Contracts shared with you by others</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredShared.map((contract) => {
                    const myPerm = contract.sharedWith?.find((u: any) => u.userId === currentUserId)?.permission;
                    return (
                      <div
                        key={contract.id}
                        className="flex items-center justify-between p-6 bg-blue-900/30 rounded-xl border border-aramco-blue-500/20 hover:bg-blue-900/50 hover:border-aramco-blue-500/40 transition-all duration-300 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-aramco-blue-600/30 rounded-xl flex items-center justify-center group-hover:bg-aramco-blue-600/50 transition-colors">
                            <FileText className="w-6 h-6 text-aramco-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-lg group-hover:text-aramco-green-400 transition-colors">
                              {contract.title}
                            </h4>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge className="bg-blue-700 text-blue-200 border-blue-400">Shared</Badge>
                              <span className="text-xs text-slate-400">Permission: <span className="font-bold text-blue-300">{myPerm}</span></span>
                            </div>
                            <div className="text-slate-300 text-sm mt-2 line-clamp-2 max-w-md">
                              {contract.content ?? ""}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/contract/${contract.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-aramco-blue-400 hover:text-white hover:bg-aramco-blue-500/20 h-10 w-10 p-0 transition-all duration-300"
                            >
                              <Eye className="w-5 h-5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                  {sharedContracts.filter((contract) => {
                    const matchesSearch =
                      contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      contract.type?.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesFilter = filterStatus === "all" || contract.status === filterStatus;
                    return matchesSearch && matchesFilter;
                  }).length > 3 && (
                    <button
                      className="text-aramco-blue-400 underline mt-2"
                      onClick={() => setShowAllShared((prev) => !prev)}
                    >
                      {showAllShared ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Chat Assistant */}
      <AIChatBar />
    </div>
  )
}
