"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Search,
  Eye,
  Download,
  Star,
  ArrowLeft,
  Users,
  Building,
  Gavel,
  Code,
  Handshake,
  Shield,
  Briefcase,
  Home,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface Template {
  id: string
  title: string
  category: string
  description: string
  rating: number
  downloads: number
  tags: string[]
  preview: string
  icon: React.ReactNode
  complexity: "Simple" | "Intermediate" | "Advanced"
}

const templates: Template[] = [
  {
    id: "1",
    title: "Service Agreement Template",
    category: "Business",
    description: "Comprehensive service agreement for professional services",
    rating: 4.8,
    downloads: 1250,
    tags: ["Professional", "Services", "B2B"],
    preview:
      "A detailed service agreement template covering scope of work, payment terms, deliverables, and termination clauses.",
    icon: <Briefcase className="w-6 h-6" />,
    complexity: "Intermediate",
  },
  {
    id: "2",
    title: "Employment Contract",
    category: "HR",
    description: "Standard employment contract with all essential clauses",
    rating: 4.9,
    downloads: 2100,
    tags: ["Employment", "HR", "Legal"],
    preview:
      "Complete employment contract including job description, compensation, benefits, and confidentiality agreements.",
    icon: <Users className="w-6 h-6" />,
    complexity: "Advanced",
  },
  {
    id: "3",
    title: "Non-Disclosure Agreement",
    category: "Legal",
    description: "Mutual NDA for protecting confidential information",
    rating: 4.7,
    downloads: 1800,
    tags: ["Confidentiality", "Legal", "Protection"],
    preview: "Bilateral NDA template for protecting sensitive business information and trade secrets.",
    icon: <Shield className="w-6 h-6" />,
    complexity: "Simple",
  },
  {
    id: "4",
    title: "Software License Agreement",
    category: "Technology",
    description: "Software licensing terms and conditions",
    rating: 4.6,
    downloads: 950,
    tags: ["Software", "License", "Technology"],
    preview: "Comprehensive software license agreement covering usage rights, restrictions, and liability terms.",
    icon: <Code className="w-6 h-6" />,
    complexity: "Advanced",
  },
  {
    id: "5",
    title: "Consulting Agreement",
    category: "Business",
    description: "Independent contractor consulting agreement",
    rating: 4.8,
    downloads: 1400,
    tags: ["Consulting", "Independent", "Professional"],
    preview: "Professional consulting agreement with project scope, deliverables, and payment schedules.",
    icon: <Handshake className="w-6 h-6" />,
    complexity: "Intermediate",
  },
  {
    id: "6",
    title: "Partnership Agreement",
    category: "Business",
    description: "Business partnership formation agreement",
    rating: 4.5,
    downloads: 680,
    tags: ["Partnership", "Business", "Formation"],
    preview: "Comprehensive partnership agreement covering profit sharing, responsibilities, and dissolution terms.",
    icon: <Building className="w-6 h-6" />,
    complexity: "Advanced",
  },
  {
    id: "7",
    title: "Lease Agreement",
    category: "Real Estate",
    description: "Residential and commercial lease agreement",
    rating: 4.7,
    downloads: 1320,
    tags: ["Lease", "Property", "Rental"],
    preview: "Standard lease agreement for residential and commercial properties with all necessary clauses.",
    icon: <Home className="w-6 h-6" />,
    complexity: "Intermediate",
  },
  {
    id: "8",
    title: "Supply Contract",
    category: "Business",
    description: "Supplier agreement for goods and materials",
    rating: 4.6,
    downloads: 890,
    tags: ["Supply", "Procurement", "Vendor"],
    preview: "Comprehensive supply contract covering delivery terms, quality standards, and payment conditions.",
    icon: <Building className="w-6 h-6" />,
    complexity: "Advanced",
  },
  {
    id: "9",
    title: "Freelancer Agreement",
    category: "HR",
    description: "Independent contractor agreement for freelancers",
    rating: 4.8,
    downloads: 1560,
    tags: ["Freelance", "Independent", "Contract"],
    preview: "Freelancer agreement covering project scope, payment terms, and intellectual property rights.",
    icon: <Users className="w-6 h-6" />,
    complexity: "Simple",
  },
  {
    id: "10",
    title: "Distribution Agreement",
    category: "Business",
    description: "Product distribution and reseller agreement",
    rating: 4.5,
    downloads: 720,
    tags: ["Distribution", "Reseller", "Sales"],
    preview: "Distribution agreement for product sales and territory management with performance metrics.",
    icon: <Briefcase className="w-6 h-6" />,
    complexity: "Advanced",
  },
  {
    id: "11",
    title: "Maintenance Contract",
    category: "Technology",
    description: "IT and equipment maintenance service agreement",
    rating: 4.7,
    downloads: 980,
    tags: ["Maintenance", "Support", "Service"],
    preview: "Maintenance contract covering service levels, response times, and support obligations.",
    icon: <Code className="w-6 h-6" />,
    complexity: "Intermediate",
  },
  {
    id: "12",
    title: "Joint Venture Agreement",
    category: "Legal",
    description: "Strategic partnership and joint venture contract",
    rating: 4.6,
    downloads: 540,
    tags: ["Joint Venture", "Partnership", "Strategic"],
    preview: "Joint venture agreement for collaborative business ventures with shared risks and rewards.",
    icon: <Gavel className="w-6 h-6" />,
    complexity: "Advanced",
  },
]

const categories = ["all", "Business", "Legal", "HR", "Technology", "Real Estate"]

export default function TemplatesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const router = useRouter()

  useEffect(() => {
    // Simulate authentication check without causing redirect loops
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem("isAuthenticated")
        if (authStatus === "true") {
          setIsAuthenticated(true)
        } else {
          // Auto-authenticate for demo purposes
          localStorage.setItem("isAuthenticated", "true")
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // Auto-authenticate on error for demo
        setIsAuthenticated(true)
      } finally {
        setIsLoading(false)
      }
    }

    // Add a small delay to prevent glitching
    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Simple":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Advanced":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const downloadTemplate = (template: Template) => {
    // Create template content based on template type
    let templateContent = ""

    switch (template.id) {
      case "1": // Service Agreement
        templateContent = `SERVICE AGREEMENT TEMPLATE

This Service Agreement ("Agreement") is entered into on [DATE] between:

CLIENT: [CLIENT NAME]
Address: [CLIENT ADDRESS]
Email: [CLIENT EMAIL]

SERVICE PROVIDER: [PROVIDER NAME]  
Address: [PROVIDER ADDRESS]
Email: [PROVIDER EMAIL]

1. SCOPE OF SERVICES
The Service Provider agrees to provide the following services:
- [SERVICE DESCRIPTION 1]
- [SERVICE DESCRIPTION 2]
- [SERVICE DESCRIPTION 3]

2. DELIVERABLES
- [DELIVERABLE 1] - Due: [DATE]
- [DELIVERABLE 2] - Due: [DATE]
- [DELIVERABLE 3] - Due: [DATE]

3. PAYMENT TERMS
- Total Contract Value: $[AMOUNT]
- Payment Schedule: [SCHEDULE]
- Payment Method: [METHOD]
- Late Payment Fee: 1.5% per month

4. TIMELINE
- Project Start Date: [START DATE]
- Project End Date: [END DATE]
- Milestones: [MILESTONE DATES]

5. INTELLECTUAL PROPERTY
All work products shall be owned by [OWNER].

6. CONFIDENTIALITY
Both parties agree to maintain confidentiality.

7. TERMINATION
Either party may terminate with [NOTICE PERIOD] days notice.

8. GOVERNING LAW
This agreement is governed by [JURISDICTION] law.

CLIENT SIGNATURE: _________________ DATE: _______
PROVIDER SIGNATURE: _______________ DATE: _______`
        break

      case "3": // NDA
        templateContent = `NON-DISCLOSURE AGREEMENT TEMPLATE

This Non-Disclosure Agreement ("Agreement") is entered into on [DATE] between:

DISCLOSING PARTY: [PARTY 1 NAME]
Address: [PARTY 1 ADDRESS]

RECEIVING PARTY: [PARTY 2 NAME]
Address: [PARTY 2 ADDRESS]

1. PURPOSE
The purpose of this Agreement is to protect confidential information shared for: [PURPOSE]

2. DEFINITION OF CONFIDENTIAL INFORMATION
Confidential Information includes:
- Technical data and specifications
- Business plans and strategies  
- Financial information
- Customer lists and data
- Proprietary processes and methods

3. OBLIGATIONS
The Receiving Party agrees to:
- Keep all information strictly confidential
- Not disclose to third parties
- Use information only for stated purpose
- Return all materials upon request

4. EXCEPTIONS
This Agreement does not apply to information that:
- Is publicly available
- Was known prior to disclosure
- Is independently developed
- Is required to be disclosed by law

5. TERM
This Agreement remains in effect for [DURATION] years.

6. REMEDIES
Breach may result in irreparable harm warranting injunctive relief.

7. GOVERNING LAW
Governed by [JURISDICTION] law.

DISCLOSING PARTY: _________________ DATE: _______
RECEIVING PARTY: __________________ DATE: _______`
        break

      case "2": // Employment Contract
        templateContent = `EMPLOYMENT CONTRACT TEMPLATE

EMPLOYMENT AGREEMENT

This Employment Agreement is entered into on [DATE] between:

EMPLOYER: [COMPANY NAME]
Address: [COMPANY ADDRESS]

EMPLOYEE: [EMPLOYEE NAME]
Address: [EMPLOYEE ADDRESS]

1. POSITION AND DUTIES
- Job Title: [JOB TITLE]
- Department: [DEPARTMENT]
- Reporting To: [SUPERVISOR]
- Start Date: [START DATE]

2. COMPENSATION
- Base Salary: $[AMOUNT] per [PERIOD]
- Payment Schedule: [SCHEDULE]
- Overtime: [OVERTIME POLICY]

3. BENEFITS
- Health Insurance: [DETAILS]
- Vacation Days: [NUMBER] days per year
- Sick Leave: [NUMBER] days per year
- Retirement Plan: [DETAILS]

4. WORKING HOURS
- Standard Hours: [HOURS] per week
- Schedule: [SCHEDULE]
- Remote Work: [POLICY]

5. PROBATIONARY PERIOD
[DURATION] months from start date.

6. CONFIDENTIALITY
Employee agrees to maintain confidentiality of company information.

7. NON-COMPETE
[NON-COMPETE TERMS]

8. TERMINATION
- Notice Period: [PERIOD]
- Severance: [TERMS]

9. GOVERNING LAW
Governed by [JURISDICTION] employment law.

EMPLOYER: _________________________ DATE: _______
EMPLOYEE: _________________________ DATE: _______`
        break

      default:
        templateContent = `${template.title.toUpperCase()} TEMPLATE

This is a professional ${template.title.toLowerCase()} template.

Please customize the following sections:
- Party Information
- Terms and Conditions  
- Payment Details
- Timeline and Deliverables
- Legal Provisions

[TEMPLATE CONTENT TO BE CUSTOMIZED]

PARTY 1: _________________________ DATE: _______
PARTY 2: _________________________ DATE: _______`
    }

    // Create and download the file
    const blob = new Blob([templateContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${template.title.replace(/\s+/g, "_")}_Template.txt`
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen aramco-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-aramco-green-500 animate-spin" />
          <div className="text-white text-lg">Loading Templates...</div>
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
                <span className="text-xl font-bold text-white">Aramco Digital</span>
                <p className="text-xs text-aramco-green-400 font-medium">Contract Templates</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Contract Templates</h1>
          <p className="text-slate-300">Choose from our comprehensive collection of professional contract templates</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-aramco-dark-800 border-aramco-dark-600 text-white placeholder:text-slate-400 focus:border-aramco-green-500 focus:ring-1 focus:ring-aramco-green-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-aramco-green-600 hover:bg-aramco-green-700 text-white"
                    : "bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
                }
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="bg-aramco-dark-800 border-aramco-dark-600 hover:bg-aramco-dark-700/70 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-aramco-blue-600/20 rounded-xl flex items-center justify-center text-aramco-blue-400">
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2">{template.title}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-600/20 text-blue-300 border-blue-600/30">{template.category}</Badge>
                        <Badge variant="outline" className={`text-xs ${getComplexityColor(template.complexity)}`}>
                          {template.complexity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm text-white">{template.rating}</span>
                  </div>
                </div>
                <CardDescription className="text-slate-300">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">{template.preview}</p>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-slate-700/50 border-slate-600 text-slate-300 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{template.downloads.toLocaleString()} downloads</span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/generator?template=${template.id}`} className="flex-1">
                      <Button className="w-full bg-aramco-green-600 hover:bg-aramco-green-700 text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="bg-transparent border-slate-600 text-white hover:bg-slate-800"
                      onClick={() => downloadTemplate(template)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
            <p className="text-slate-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
