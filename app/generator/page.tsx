"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Brain,
  FileText,
  Users,
  Calendar,
  Loader2,
  Wand2,
  Briefcase,
  Shield,
  Code,
  Handshake,
  Calendar as CalendarIcon,
} from "lucide-react"
import Link from "next/link"
import { app } from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";

// Template-specific field configurations
const templateFields = {
  "1": {
    // Service Agreement
    title: "Service Agreement",
    icon: <Briefcase className="w-7 h-7 text-white" />,
    fields: [
      {
        name: "serviceDescription",
        label: "Service Description",
        type: "textarea",
        required: true,
        placeholder: "Describe the services to be provided in detail",
      },
      {
        name: "deliverables",
        label: "Key Deliverables",
        type: "textarea",
        required: true,
        placeholder: "List main deliverables and their deadlines",
      },
      {
        name: "paymentTerms",
        label: "Payment Terms",
        type: "select",
        required: true,
        options: ["Net 30", "Net 45", "Net 60", "Upon completion", "50% upfront, 50% completion", "Monthly payments"],
      },
      {
        name: "projectTimeline",
        label: "Project Timeline",
        type: "text",
        required: true,
        placeholder: "e.g., 3 months, 6 weeks",
      },
      {
        name: "intellectualProperty",
        label: "Intellectual Property Ownership",
        type: "select",
        required: true,
        options: ["Client owns all IP", "Service provider retains IP", "Shared ownership", "Custom arrangement"],
      },
      {
        name: "terminationNotice",
        label: "Termination Notice Period",
        type: "select",
        required: true,
        options: ["30 days", "60 days", "90 days", "Immediate with cause"],
      },
    ],
  },
  "2": {
    // Employment Contract
    title: "Employment Contract",
    icon: <Users className="w-7 h-7 text-white" />,
    fields: [
      {
        name: "jobTitle",
        label: "Job Title",
        type: "text",
        required: true,
        placeholder: "e.g., Senior Software Engineer, Marketing Manager",
      },
      {
        name: "department",
        label: "Department",
        type: "text",
        required: true,
        placeholder: "e.g., Engineering, Marketing, Sales",
      },
      {
        name: "supervisor",
        label: "Reports To",
        type: "text",
        required: true,
        placeholder: "e.g., Engineering Manager, VP of Sales",
      },
      {
        name: "salary",
        label: "Annual Salary",
        type: "text",
        required: true,
        placeholder: "e.g., $120,000, $85,000",
      },
      {
        name: "workingHours",
        label: "Working Hours",
        type: "select",
        required: true,
        options: ["40 hours/week", "35 hours/week", "Flexible hours", "Part-time (20 hours)", "Part-time (30 hours)"],
      },
      {
        name: "benefits",
        label: "Benefits Package",
        type: "textarea",
        required: true,
        placeholder: "Health insurance, dental, 401k matching, vacation days, sick leave, etc.",
      },
      {
        name: "probationPeriod",
        label: "Probation Period",
        type: "select",
        required: true,
        options: ["3 months", "6 months", "12 months", "No probation period"],
      },
      {
        name: "remoteWork",
        label: "Remote Work Policy",
        type: "select",
        required: true,
        options: ["Fully remote", "Hybrid (2-3 days office)", "Hybrid (flexible)", "On-site only"],
      },
      {
        name: "vacationDays",
        label: "Vacation Days per Year",
        type: "text",
        required: true,
        placeholder: "e.g., 15 days, 20 days, 25 days",
      },
    ],
  },
  "3": {
    // NDA
    title: "Non-Disclosure Agreement",
    icon: <Shield className="w-7 h-7 text-white" />,
    fields: [
      {
        name: "purpose",
        label: "Purpose of Disclosure",
        type: "textarea",
        required: true,
        placeholder:
          "Describe why confidential information is being shared (e.g., potential partnership, investment discussion)",
      },
      {
        name: "confidentialInfo",
        label: "Types of Confidential Information",
        type: "textarea",
        required: true,
        placeholder:
          "Technical data, business plans, financial information, customer lists, proprietary processes, etc.",
      },
      {
        name: "permittedUses",
        label: "Permitted Uses",
        type: "textarea",
        required: true,
        placeholder: "How the receiving party may use the confidential information",
      },
      {
        name: "ndaDuration",
        label: "Agreement Duration",
        type: "select",
        required: true,
        options: ["1 year", "2 years", "3 years", "5 years", "Indefinite"],
      },
      {
        name: "returnRequirement",
        label: "Information Return Policy",
        type: "select",
        required: true,
        options: ["Upon request", "End of agreement", "End of project", "Not required"],
      },
      {
        name: "exceptions",
        label: "Information Exceptions",
        type: "textarea",
        required: false,
        placeholder: "Information that is publicly available, independently developed, etc.",
      },
    ],
  },
  "4": {
    // Software License
    title: "Software License Agreement",
    icon: <Code className="w-7 h-7 text-white" />,
    fields: [
      {
        name: "softwareName",
        label: "Software Name",
        type: "text",
        required: true,
        placeholder: "e.g., ProjectManager Pro, DataAnalyzer Suite",
      },
      {
        name: "licenseType",
        label: "License Type",
        type: "select",
        required: true,
        options: ["Single User", "Multi-User (5 seats)", "Multi-User (10 seats)", "Enterprise", "Site License"],
      },
      {
        name: "usageRights",
        label: "Usage Rights",
        type: "textarea",
        required: true,
        placeholder: "Describe what the licensee can and cannot do with the software",
      },
      {
        name: "restrictions",
        label: "Usage Restrictions",
        type: "textarea",
        required: true,
        placeholder: "No reverse engineering, no redistribution, no modification, etc.",
      },
      {
        name: "supportLevel",
        label: "Support Level",
        type: "select",
        required: true,
        options: ["Basic email support", "Priority support", "24/7 support", "No support included"],
      },
      {
        name: "updates",
        label: "Updates Policy",
        type: "select",
        required: true,
        options: ["Free updates for 1 year", "Free updates for life", "Paid updates only", "No updates"],
      },
    ],
  },
  "5": {
    // Consulting Agreement
    title: "Consulting Agreement",
    icon: <Brain className="w-7 h-7 text-white" />,
    fields: [
      {
        name: "consultingServices",
        label: "Consulting Services",
        type: "textarea",
        required: true,
        placeholder: "Describe the consulting services to be provided in detail",
      },
      {
        name: "objectives",
        label: "Project Objectives",
        type: "textarea",
        required: true,
        placeholder: "What are the main goals and expected outcomes?",
      },
      {
        name: "hourlyRate",
        label: "Hourly Rate",
        type: "text",
        required: true,
        placeholder: "e.g., $150/hour, $200/hour",
      },
      {
        name: "estimatedHours",
        label: "Estimated Total Hours",
        type: "text",
        required: true,
        placeholder: "e.g., 40 hours, 100 hours",
      },
      {
        name: "expensePolicy",
        label: "Expense Reimbursement",
        type: "select",
        required: true,
        options: [
          "All reasonable expenses reimbursed",
          "Pre-approved expenses only",
          "No expense reimbursement",
          "Fixed expense allowance",
        ],
      },
      {
        name: "deliverables",
        label: "Expected Deliverables",
        type: "textarea",
        required: true,
        placeholder: "Reports, recommendations, presentations, etc.",
      },
    ],
  },
  "6": {
    // Partnership Agreement
    title: "Partnership Agreement",
    icon: <Handshake className="w-7 h-7 text-white" />,
    fields: [
      {
        name: "businessPurpose",
        label: "Business Purpose",
        type: "textarea",
        required: true,
        placeholder: "Describe the purpose and nature of the partnership business",
      },
      {
        name: "partnershipType",
        label: "Partnership Type",
        type: "select",
        required: true,
        options: ["General Partnership", "Limited Partnership", "Limited Liability Partnership (LLP)"],
      },
      {
        name: "capitalContributions",
        label: "Capital Contributions",
        type: "textarea",
        required: true,
        placeholder: "Describe each partner's initial capital contribution (cash, assets, services)",
      },
      {
        name: "profitSharing",
        label: "Profit/Loss Sharing",
        type: "text",
        required: true,
        placeholder: "e.g., 50/50, 60/40, Equal shares",
      },
      {
        name: "managementRoles",
        label: "Management Responsibilities",
        type: "textarea",
        required: true,
        placeholder: "Describe each partner's roles and responsibilities",
      },
      {
        name: "decisionMaking",
        label: "Decision Making Process",
        type: "select",
        required: true,
        options: ["Unanimous consent", "Majority vote", "Managing partner decides", "Specific voting rights"],
      },
    ],
  },
}

function GeneratorContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [formData, setFormData] = useState<Record<string, string>>({
    contractType: "",
    title: "",
    description: "",
    party1Name: "",
    party1Type: "",
    party1Address: "",
    party2Name: "",
    party2Type: "",
    party2Address: "",
    duration: "",
    value: "",
    startDate: "",
    endDate: "",
    specialTerms: "",
  })
  const [initialized, setInitialized] = useState(false)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const router = useRouter()
  const searchParams = useSearchParams()

  // Separate effect for authentication
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true"); // Optional: keep for legacy
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Separate effect for template initialization - only run once
  useEffect(() => {
    if (!initialized && searchParams) {
      const templateId = searchParams.get("template")
      if (templateId && templateFields[templateId as keyof typeof templateFields]) {
        setSelectedTemplate(templateId)
        setFormData((prev) => ({
          ...prev,
          contractType: templateId,
        }))
      }
      setInitialized(true)
    }
  }, [searchParams, initialized])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    setFormData((prev) => ({
      ...prev,
      contractType: templateId,
    }))
  }

  // Helper to create or update a contract
  type ContractStatus = "draft" | "in progress" | "complete";
  const createOrUpdateContract = async (
    contractId: string | null,
    title: string,
    content: string,
    status: ContractStatus = "draft"
  ) => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore(app);
    const contractData = {
      user_id: user.uid,
      title,
      content,
      status,
      updated_at: new Date().toISOString(),
    };
    try {
      if (contractId) {
        // Update existing contract
        await setDoc(doc(db, "contracts", contractId), contractData, { merge: true });
        return contractId;
      } else {
        // Create new contract
        const docRef = await addDoc(collection(db, "contracts"), {
          ...contractData,
          created_at: new Date().toISOString(),
        });
        return docRef.id;
      }
    } catch (err: any) {
      alert("Error saving contract: " + err.message);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        alert("User not authenticated.");
        setIsGenerating(false);
        return;
      }
      // Get the Firebase ID token
      const token = await user.getIdToken();
      // Send form data to the backend API to generate the contract
      const response = await fetch("/api/contracts/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, templateId: selectedTemplate }),
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.error || "Failed to generate contract");
        setIsGenerating(false);
        return;
      }
      // Get the Firestore document ID from the API response
      const contractId = data.firestoreId || data.contractId || data.id;
      if (contractId) {
        alert("Contract generated successfully!");
        router.push(`/contract/${contractId}`);
      } else {
        alert("Contract generated but could not find contract ID.");
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      alert("Failed to generate contract: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentTemplate = selectedTemplate ? templateFields[selectedTemplate as keyof typeof templateFields] : null

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
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">ContractForge</span>
                <p className="text-xs aramco-text-primary font-medium">AI Generator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-2xl flex items-center justify-center">
              {currentTemplate?.icon || <Brain className="w-7 h-7 text-white" />}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                {currentTemplate ? `${currentTemplate.title} Generator` : "AI Contract Generator"}
              </h1>
              <p className="text-slate-300">
                {currentTemplate
                  ? `Generate a professional ${currentTemplate.title.toLowerCase()} with AI`
                  : "Generate professional contracts using AI based on your requirements"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Type Selection */}
            {!selectedTemplate && (
              <Card className="aramco-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Select Contract Type
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Choose the type of contract you want to generate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractType" className="text-white">
                      Contract Type
                    </Label>
                    <Select value={formData.contractType} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="1">Service Agreement</SelectItem>
                        <SelectItem value="2">Employment Contract</SelectItem>
                        <SelectItem value="3">Non-Disclosure Agreement</SelectItem>
                        <SelectItem value="4">Software License Agreement</SelectItem>
                        <SelectItem value="5">Consulting Agreement</SelectItem>
                        <SelectItem value="6">Partnership Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Template-Specific Fields */}
            {currentTemplate && (
              <Card className="aramco-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {currentTemplate.icon}
                    {currentTemplate.title} Details
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Fill in the specific details for your {currentTemplate.title.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    {currentTemplate.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label className="text-white">
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </Label>
                        {field.type === "text" && (
                          <Input
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="aramco-input"
                          />
                        )}
                        {field.type === "textarea" && (
                          <Textarea
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="aramco-input min-h-[100px]"
                          />
                        )}
                        {field.type === "select" && field.options && (
                          <Select
                            value={formData[field.name] || ""}
                            onValueChange={(value) => handleInputChange(field.name, value)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              {field.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parties Information */}
            {selectedTemplate && (
              <Card className="aramco-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Contract Parties
                  </CardTitle>
                  <CardDescription className="text-slate-300">Information about the parties involved</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Party 1 */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">First Party</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Name/Company</Label>
                        <Input
                          placeholder="Enter name or company"
                          value={formData.party1Name}
                          onChange={(e) => handleInputChange("party1Name", e.target.value)}
                          className="aramco-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Type</Label>
                        <Select
                          value={formData.party1Type}
                          onValueChange={(value) => handleInputChange("party1Type", value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Address</Label>
                      <Textarea
                        placeholder="Enter full address"
                        value={formData.party1Address}
                        onChange={(e) => handleInputChange("party1Address", e.target.value)}
                        className="aramco-input"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Party 2 */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">Second Party</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Name/Company</Label>
                        <Input
                          placeholder="Enter name or company"
                          value={formData.party2Name}
                          onChange={(e) => handleInputChange("party2Name", e.target.value)}
                          className="aramco-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Type</Label>
                        <Select
                          value={formData.party2Type}
                          onValueChange={(value) => handleInputChange("party2Type", value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Address</Label>
                      <Textarea
                        placeholder="Enter full address"
                        value={formData.party2Address}
                        onChange={(e) => handleInputChange("party2Address", e.target.value)}
                        className="aramco-input"
                        rows={2}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contract Terms */}
            {selectedTemplate && (
              <Card className="aramco-card">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Contract Terms
                  </CardTitle>
                  <CardDescription className="text-slate-300">Duration, value, and additional terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Start Date</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          className="aramco-input"
                          style={{ display: showStartDatePicker ? undefined : "none" }}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowStartDatePicker((v) => !v)}
                          className="p-2"
                          aria-label="Pick start date"
                        >
                          <CalendarIcon className="w-5 h-5 text-aramco-accent-blue" />
                        </Button>
                        {!showStartDatePicker && (
                          <span className="text-white text-sm">{formData.startDate || "Select date"}</span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">End Date</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange("endDate", e.target.value)}
                          className="aramco-input"
                          style={{ display: showEndDatePicker ? undefined : "none" }}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setShowEndDatePicker((v) => !v)}
                          className="p-2"
                          aria-label="Pick end date"
                        >
                          <CalendarIcon className="w-5 h-5 text-aramco-accent-blue" />
                        </Button>
                        {!showEndDatePicker && (
                          <span className="text-white text-sm">{formData.endDate || "Select date"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Contract Value</Label>
                      <Input
                        placeholder="e.g., $50,000"
                        value={formData.value}
                        onChange={(e) => handleInputChange("value", e.target.value)}
                        className="aramco-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Duration</Label>
                      <Input
                        placeholder="e.g., 12 months"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        className="aramco-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Special Terms & Conditions</Label>
                    <Textarea
                      placeholder="Any specific terms, conditions, or requirements"
                      value={formData.specialTerms}
                      onChange={(e) => handleInputChange("specialTerms", e.target.value)}
                      className="aramco-input min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Generate Button */}
            <Card className="aramco-card">
              <CardContent className="p-6">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedTemplate || !formData.party1Name || !formData.party2Name}
                  className="w-full aramco-button-primary py-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Contract...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Contract
                    </>
                  )}
                </Button>
                <p className="text-sm text-slate-400 mt-2 text-center">
                  AI will generate a professional contract based on your inputs
                </p>
              </CardContent>
            </Card>

            {/* Template Info */}
            {currentTemplate && (
              <Card className="aramco-card">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    {currentTemplate.icon}
                    {currentTemplate.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600/20 text-green-300 border-green-600/30">✓</Badge>
                    <span className="text-sm text-slate-300">Template-specific fields</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600/20 text-green-300 border-green-600/30">✓</Badge>
                    <span className="text-sm text-slate-300">Legal compliance check</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600/20 text-green-300 border-green-600/30">✓</Badge>
                    <span className="text-sm text-slate-300">Industry-specific clauses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600/20 text-green-300 border-green-600/30">✓</Badge>
                    <span className="text-sm text-slate-300">Professional formatting</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="aramco-card">
              <CardHeader>
                <CardTitle className="text-white text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-slate-300">• Fill all required fields marked with *</p>
                <p className="text-sm text-slate-300">• Be specific in your descriptions</p>
                <p className="text-sm text-slate-300">• Include all relevant parties</p>
                <p className="text-sm text-slate-300">• Review generated content carefully</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen aramco-gradient flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-aramco-green-500 animate-spin" />
            <div className="text-white text-lg">Loading Generator...</div>
          </div>
        </div>
      }
    >
      <GeneratorContent />
    </Suspense>
  )
}
