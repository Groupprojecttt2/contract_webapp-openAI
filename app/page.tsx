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
  Star,
  Award,
  Clock,
  Target,
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"

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
      highlight: "99.8% Accuracy",
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Smart Analysis",
      description: "Comprehensive contract analysis with risk assessment and compliance checking",
      color: "aramco-accent-blue",
      highlight: "Real-time",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Continuous Improvement",
      description: "AI-driven suggestions for contract optimization and enhancement",
      color: "aramco-accent-yellow",
      highlight: "AI Optimized",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption and compliance",
      color: "aramco-accent-red",
      highlight: "SOC 2 Compliant",
    },
  ]

  const stats = [
    { label: "Contracts Generated", value: "50,000+", icon: <FileText className="w-5 h-5" />, trend: "+15%" },
    { label: "Time Saved", value: "95%", icon: <Zap className="w-5 h-5" />, trend: "+8%" },
    { label: "Accuracy Rate", value: "99.8%", icon: <CheckCircle className="w-5 h-5" />, trend: "+2%" },
    { label: "Enterprise Clients", value: "500+", icon: <Users className="w-5 h-5" />, trend: "+25%" },
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Legal Director",
      company: "TechCorp Inc.",
      content: "Aramco Digital's contract generator has revolutionized our legal workflow. We've reduced contract creation time by 90%.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "General Counsel",
      company: "Global Solutions",
      content: "The AI-powered analysis features are incredibly accurate. It's like having an expert legal team available 24/7.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen aramco-gradient animate-gradient-shift">
      {/* Enhanced Particle Background */}
      <div className="aramco-particles"></div>

      {/* Header */}
      <header className="aramco-header backdrop-blur-enhanced">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in-scale">
            <div className="w-12 h-12 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center shadow-2xl aramco-icon-glow animate-pulse-green">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground animate-glow">Aramco Digital</span>
              <p className="text-sm aramco-text-primary font-medium">Contract Generator</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:bg-muted hover:text-aramco-green-400 transition-all duration-300 focus-ring">
                Sign In
              </Button>
            </Link>
            <Button onClick={handleGetStarted} disabled={isLoading} className="aramco-button-enhanced">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-slide-in-up">
          <Badge className="aramco-accent-green mb-6 px-4 py-2 animate-border-glow">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Advanced AI
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Next-Generation
            <span className="text-gradient text-shadow-glow"> Contract </span>
            Intelligence
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your contract workflow with AI-powered generation, analysis, and optimization. Built for
            enterprise-scale operations with Aramco Digital's trusted technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              size="lg"
              className="aramco-button-enhanced text-lg px-8 py-4 hover-lift"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                <>
                  Start Generating Contracts
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            <Link href="/templates">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 bg-transparent border-border text-foreground hover:bg-muted hover-glow focus-ring"
              >
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 grid-animate-in">
          {stats.map((stat, index) => (
            <Card key={index} className="aramco-card-enhanced hover-lift">
              <CardContent className="p-6">
                <div className="flex justify-center mb-3 text-aramco-green-400 aramco-icon-glow">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
                <div className="flex items-center justify-center text-xs text-aramco-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.trend}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-slide-in-up">
          <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to streamline your contract management process
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 grid-animate-in">
          {features.map((feature, index) => (
            <Card key={index} className="aramco-card-enhanced hover-scale group">
              <CardHeader>
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${feature.color} group-hover:animate-pulse-green`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-foreground text-xl">{feature.title}</CardTitle>
                <Badge className="text-xs bg-aramco-green-500/20 text-aramco-green-400 border-aramco-green-500/30 w-fit">
                  {feature.highlight}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced Contract Types Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-slide-in-up">
          <h2 className="text-4xl font-bold text-foreground mb-4">Comprehensive Template Library</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Professional templates for every business need</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 animate-fade-in-scale">
          {contractTypes.map((type, index) => (
            <Badge
              key={index}
              variant="outline"
              className="bg-card border-border text-foreground px-4 py-2 text-sm hover:bg-muted hover-glow transition-all duration-300 cursor-pointer"
            >
              {type}
            </Badge>
          ))}
        </div>
      </section>

      {/* New Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-slide-in-up">
          <h2 className="text-4xl font-bold text-foreground mb-4">Trusted by Industry Leaders</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">See what our clients say about Aramco Digital</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 grid-animate-in">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="aramco-card-enhanced hover-lift">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="aramco-card-enhanced max-w-4xl mx-auto animate-fade-in-scale">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 aramco-icon-glow animate-pulse-green">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Transform Your Contracts?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using Aramco Digital's Contract Generator to streamline their legal
              workflows.
            </p>
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              size="lg"
              className="aramco-button-enhanced text-lg px-8 py-4 hover-lift"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                <>
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-border bg-muted/50 backdrop-blur-enhanced">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center aramco-icon-glow">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">Aramco Digital</span>
                <p className="text-xs aramco-text-primary">Contract Generator</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
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
