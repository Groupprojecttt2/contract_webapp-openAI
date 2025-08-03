"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  Clock,
  MessageSquare,
  Bell,
  User,
  Share2,
  Copy,
  Mail,
  Save,
} from "lucide-react"
import Link from "next/link"

interface Contract {
  id: string
  title: string
  type: string
  status: "draft" | "active" | "expired" | "pending"
  parties: string[]
  createdDate: string
  expiryDate: string
  content?: string
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  company?: string
  createdAt: string
  lastLogin?: string
  contracts?: Contract[]
}

export function InteractiveDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    bio: "",
  })
  const router = useRouter()

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    const userEmail = localStorage.getItem("userEmail")

    if (!authStatus || !userEmail) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
      fetchUserProfile(userEmail)
    }
  }, [router])

  const fetchUserProfile = async (email: string) => {
    try {
      const response = await fetch(`/api/user/profile?email=${email}`)
      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setContracts(data.user.contracts || [])
        setProfileForm({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          company: data.user.company || "",
          phone: data.user.phone || "",
          bio: data.user.bio || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userData")
    router.push("/")
  }

  const handleProfileUpdate = async () => {
    if (!user) return

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          updates: profileForm,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        setShowProfileDialog(false)
        alert("Profile updated successfully!")
      } else {
        alert(data.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      alert("Network error. Please try again.")
    }
  }

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm("Are you sure you want to delete this contract?")) return

    // Remove from local state
    setContracts((prev) => prev.filter((c) => c.id !== contractId))

    // In production, also delete from backend
    alert("Contract deleted successfully!")
  }

  const handleShareContract = (contract: Contract) => {
    setSelectedContract(contract)
    setShowShareDialog(true)
  }

  const copyShareLink = () => {
    if (selectedContract) {
      const shareLink = `${window.location.origin}/contract/${selectedContract.id}`
      navigator.clipboard.writeText(shareLink)
      alert("Share link copied to clipboard!")
    }
  }

  const sendContractByEmail = () => {
    if (selectedContract) {
      const subject = `Contract: ${selectedContract.title}`
      const body = `Please review the contract: ${window.location.origin}/contract/${selectedContract.id}`
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "aramco-accent-green"
      case "draft":
        return "aramco-accent-yellow"
      case "pending":
        return "aramco-accent-blue"
      case "expired":
        return "aramco-accent-red"
      default:
        return "bg-aramco-dark-600/20 text-aramco-dark-300 border-aramco-dark-600/30"
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || contract.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active").length,
    pending: contracts.filter((c) => c.status === "pending").length,
    expiring: contracts.filter((c) => {
      const expiryDate = new Date(c.expiryDate)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return expiryDate <= thirtyDaysFromNow && c.status === "active"
    }).length,
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen aramco-gradient flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen aramco-gradient">
      {/* Header */}
      <header className="aramco-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">ContractForge</span>
              <p className="text-xs aramco-text-primary font-medium">Enterprise Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-aramco-dark-300">
              Welcome,{" "}
              <span className="aramco-text-primary">
                {user.firstName} {user.lastName}
              </span>
            </span>

            {/* Notifications */}
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>

            {/* Profile */}
            <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="aramco-card max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Edit Profile</DialogTitle>
                  <DialogDescription className="text-aramco-dark-300">
                    Update your account information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">First Name</Label>
                      <Input
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                        className="aramco-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Last Name</Label>
                      <Input
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                        className="aramco-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Company</Label>
                    <Input
                      value={profileForm.company}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, company: e.target.value }))}
                      className="aramco-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Phone</Label>
                    <Input
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="aramco-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Bio</Label>
                    <Textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                      className="aramco-input"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleProfileUpdate} className="aramco-button-primary flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProfileDialog(false)}
                      className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800 hover:border-aramco-green-500"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-aramco-dark-300 text-lg">
              Manage your contracts and templates • Last login:{" "}
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "First time"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <Link href="/chat">
              <Button
                variant="outline"
                className="bg-transparent border-aramco-green-500 text-aramco-green-400 hover:bg-aramco-green-500/10"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
            </Link>
            <Link href="/templates">
              <Button
                variant="outline"
                className="bg-transparent border-aramco-blue-500 text-aramco-blue-400 hover:bg-aramco-blue-500/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Browse Templates
              </Button>
            </Link>
            <Link href="/generator">
              <Button className="aramco-button-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Contract
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="aramco-card hover:bg-aramco-dark-700/70 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aramco-dark-300 text-sm font-medium">Total Contracts</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-aramco-blue-500 to-aramco-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aramco-card hover:bg-aramco-dark-700/70 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aramco-dark-300 text-sm font-medium">Active</p>
                  <p className="text-3xl font-bold text-white">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-aramco-green-500 to-aramco-green-600 rounded-xl flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aramco-card hover:bg-aramco-dark-700/70 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aramco-dark-300 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-white">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="aramco-card hover:bg-aramco-dark-700/70 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-aramco-dark-300 text-sm font-medium">Expiring Soon</p>
                  <p className="text-3xl font-bold text-white">{stats.expiring}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aramco-dark-400 w-4 h-4" />
            <Input
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

        {/* Contracts Table */}
        <Card className="aramco-card">
          <CardHeader>
            <CardTitle className="text-white text-xl">Your Contracts</CardTitle>
            <CardDescription className="text-aramco-dark-300">
              {filteredContracts.length} of {contracts.length} contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-aramco-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No contracts found</h3>
                <p className="text-aramco-dark-400 mb-4">
                  {contracts.length === 0
                    ? "Create your first contract to get started"
                    : "Try adjusting your search or filter criteria"}
                </p>
                <Link href="/generator">
                  <Button className="aramco-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Contract
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-6 bg-aramco-dark-700/30 rounded-xl border border-aramco-dark-600/50 hover:bg-aramco-dark-700/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-white text-lg">{contract.title}</h3>
                        <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-aramco-dark-300">
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {contract.type}
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {contract.parties?.join(", ") || "Multiple parties"}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Created: {contract.createdDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/contract/${contract.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-aramco-green-500 text-aramco-green-400 hover:bg-aramco-green-500/10"
                          title="View Contract"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-aramco-blue-500 text-aramco-blue-400 hover:bg-aramco-blue-500/10"
                        title="Edit Contract"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShareContract(contract)}
                        className="bg-transparent border-aramco-yellow-500 text-aramco-yellow-400 hover:bg-aramco-yellow-500/10"
                        title="Share Contract"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-700"
                        title="Download Contract"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteContract(contract.id)}
                        className="bg-transparent border-red-600 text-red-400 hover:bg-red-900/20"
                        title="Delete Contract"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="aramco-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Share Contract</DialogTitle>
            <DialogDescription className="text-aramco-dark-300">
              Share "{selectedContract?.title}" with others
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={copyShareLink} className="aramco-button-primary flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={sendContractByEmail} className="aramco-button-secondary flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
            <div className="p-3 bg-aramco-dark-700 rounded-lg">
              <p className="text-xs text-aramco-dark-400 mb-1">Share URL:</p>
              <p className="text-sm text-white break-all">
                {selectedContract && `${window.location.origin}/contract/${selectedContract.id}`}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
