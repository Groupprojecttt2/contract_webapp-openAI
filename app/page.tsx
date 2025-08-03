"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Brain,
  FileCheck,
  TrendingUp,
  Globe,
  Lock,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGetStarted = () => {
    setIsLoading(true)
    // Auto-authenticate for demo
    localStorage.setItem("isAuthenticated", "true")
    localStorage.setItem("userEmail", "demo@aramco.com")
    localStorage.setItem("userName", "Demo User")
    router.push("/dashboard")
  }

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Generation",
      description: "Advanced GPT-4 powered contract generation with industry-specific templates",
      color: "aramco-accent-green",
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Smart Analysis",
      description: "Comprehensive contract analysis with risk assessment and compliance checking",
      color: "aramco-accent-blue",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Continuous Improvement",
      description: "AI-driven suggestions for contract optimization and enhancement",
      color: "aramco-accent-yellow",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption and compliance",
      color: "aramco-accent-red",
    },
  ]

  const stats = [
    { label: "Contracts Generated", value: "50,000+", icon: <FileText className="w-5 h-5" /> },
    { label: "Time Saved", value: "95%", icon: <Zap className="w-5 h-5" /> },
    { label: "Accuracy Rate", value: "99.8%", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Enterprise Clients", value: "500+", icon: <Users className="w-5 h-5" /> },
  ]

  const contractTypes = [
    "Service Agreements",
    "Employment Contracts",
    "NDAs",
    "Partnership Agreements",
    "Software Licenses",
    "Consulting Agreements",
    "Supply Contracts",
    "Lease Agreements",
  ]

  return (
    <div className="min-h-screen aramco-gradient">
      {/* Header */}
      <header className="aramco-header">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Aramco Digital</span>
              <p className="text-sm aramco-text-primary font-medium">Contract Generator</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-aramco-dark-800">
                Sign In
              </Button>
            </Link>
            <Button onClick={handleGetStarted} disabled={isLoading} className="aramco-button-primary">
              {isLoading ? "Loading..." : "Get Started"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="aramco-accent-green mb-6 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Advanced AI
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Next-Generation
            <span className="aramco-text-primary"> Contract </span>
            Intelligence
          </h1>
          <p className="text-xl text-slate-300 mb-8 leading-relaxed">
            Transform your contract workflow with AI-powered generation, analysis, and optimization. Built for
            enterprise-scale operations with Aramco Digital's trusted technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              size="lg"
              className="aramco-button-primary text-lg px-8 py-4"
            >
              {isLoading ? "Loading..." : "Start Generating Contracts"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link href="/templates">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 bg-transparent border-aramco-dark-600 text-white hover:bg-aramco-dark-800"
              >
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="aramco-card text-center">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3 text-aramco-green-400">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to streamline your contract management process
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="aramco-card hover:bg-aramco-dark-700/70 transition-colors">
              <CardHeader>
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contract Types Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Comprehensive Template Library</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">Professional templates for every business need</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {contractTypes.map((type, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-aramco-dark-700/50 border-aramco-dark-600 text-white px-4 py-2 text-sm hover:bg-aramco-dark-600 transition-colors cursor-pointer"
            >
              {type}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="aramco-card max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Contracts?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using Aramco Digital's Contract Generator to streamline their legal
              workflows.
            </p>
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              size="lg"
              className="aramco-button-primary text-lg px-8 py-4"
            >
              {isLoading ? "Loading..." : "Get Started Now"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-aramco-dark-700 bg-aramco-dark-900/50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">Aramco Digital</span>
                <p className="text-xs aramco-text-primary">Contract Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>SOC 2 Compliant</span>
              </div>
              <span>© 2024 Aramco Digital. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
