"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, FileText, Building, Users, Briefcase, Code, Handshake, Star, Download, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface Template {
  id: string
  name: string
  description: string
  category: string
  difficulty: "Simple" | "Intermediate" | "Advanced"
  rating: number
  downloads: number
  preview: string
  icon: any
}

const templates: Template[] = [
  {
    id: "service-agreement",
    name: "Service Agreement",
    description: "Professional service contract for consulting and business services",
    category: "Business",
    difficulty: "Simple",
    rating: 4.8,
    downloads: 1250,
    preview: "A comprehensive service agreement covering scope of work, payment terms, and deliverables...",
    icon: Briefcase,
  },
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    description: "Confidentiality agreement to protect sensitive business information",
    category: "Legal",
    difficulty: "Simple",
    rating: 4.9,
    downloads: 2100,
    preview: "Standard NDA template with mutual confidentiality provisions and legal protections...",
    icon: FileText,
  },
  {
    id: "employment",
    name: "Employment Contract",
    description: "Comprehensive employment agreement with benefits and terms",
    category: "HR",
    difficulty: "Intermediate",
    rating: 4.7,
    downloads: 890,
    preview: "Full employment contract including salary, benefits, responsibilities, and termination clauses...",
    icon: Users,
  },
  {
    id: "oil-gas-lease",
    name: "Oil & Gas Lease Agreement",
    description: "Specialized lease agreement for oil and gas exploration rights",
    category: "Oil & Gas",
    difficulty: "Advanced",
    rating: 4.6,
    downloads: 340,
    preview: "Complex lease agreement for mineral rights, royalties, and exploration terms...",
    icon: Building,
  },
  {
    id: "software-license",
    name: "Software License Agreement",
    description: "Software licensing contract with usage rights and restrictions",
    category: "Technology",
    difficulty: "Intermediate",
    rating: 4.8,
    downloads: 670,
    preview: "Software license covering usage rights, restrictions, and intellectual property...",
    icon: Code,
  },
  {
    id: "partnership",
    name: "Partnership Agreement",
    description: "Business partnership contract defining roles and profit sharing",
    category: "Business",
    difficulty: "Advanced",
    rating: 4.5,
    downloads: 420,
    preview: "Partnership agreement covering equity, responsibilities, and profit distribution...",
    icon: Handshake,
  },
]

interface TemplateSelectionDialogProps {
  children: React.ReactNode
}

export function TemplateSelectionDialog({ children }: TemplateSelectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const router = useRouter()

  const categories = ["All", "Business", "Legal", "HR", "Oil & Gas", "Technology"]

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleTemplateSelect = (template: Template) => {
    // Store selected template in localStorage
    localStorage.setItem("selectedTemplate", JSON.stringify(template))
    setOpen(false)
    router.push("/generator")
  }

  const handleStartFromScratch = () => {
    // Clear any selected template
    localStorage.removeItem("selectedTemplate")
    setOpen(false)
    router.push("/generator")
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Simple":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Intermediate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="aramco-card max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Choose a Template</DialogTitle>
          <DialogDescription className="text-aramco-dark-300">
            Start with a professional template or create from scratch
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aramco-dark-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 aramco-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-aramco-dark-700 border border-aramco-dark-600 rounded-lg text-white"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Start from Scratch Option */}
          <Card className="aramco-card border-2 border-dashed border-aramco-green-500/50 hover:border-aramco-green-500 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-aramco-green-500 to-aramco-green-600 rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Start from Scratch</h3>
                    <p className="text-aramco-dark-300">Create a custom contract with AI assistance</p>
                  </div>
                </div>
                <Button onClick={handleStartFromScratch} className="aramco-button-primary">
                  Create Custom
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Templates Grid */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-aramco-dark-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
                <p className="text-aramco-dark-400">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const IconComponent = template.icon
                return (
                  <Card
                    key={template.id}
                    className="aramco-card hover:bg-aramco-dark-700/50 transition-colors cursor-pointer"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-aramco-blue-500 to-aramco-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                              <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                              <Badge className="bg-aramco-dark-600/50 text-aramco-dark-300 border-aramco-dark-600">
                                {template.category}
                              </Badge>
                            </div>
                            <p className="text-aramco-dark-300 mb-3">{template.description}</p>
                            <p className="text-sm text-aramco-dark-400 line-clamp-2">{template.preview}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-aramco-dark-400">
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                {template.rating}
                              </span>
                              <span className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                {template.downloads.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent border-aramco-blue-500 text-aramco-blue-400 hover:bg-aramco-blue-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              alert(`Preview for ${template.name}:\n\n${template.preview}`)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="aramco-button-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTemplateSelect(template)
                            }}
                          >
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
