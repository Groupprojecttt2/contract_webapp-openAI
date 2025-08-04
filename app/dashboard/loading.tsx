import { Card, CardContent } from "@/components/ui/card"
import { FileText, Clock, CheckCircle, Users } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen aramco-gradient animate-gradient-shift">
      {/* Enhanced Particle Background */}
      <div className="aramco-particles"></div>

      {/* Header Skeleton */}
      <header className="aramco-header backdrop-blur-enhanced sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 animate-fade-in-scale">
            <div className="w-12 h-12 bg-gradient-to-br from-aramco-green-500 to-aramco-blue-500 rounded-xl flex items-center justify-center shadow-2xl aramco-icon-glow animate-pulse-green">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="h-8 w-32 bg-muted rounded skeleton"></div>
              <div className="h-4 w-24 bg-muted/70 rounded mt-1 skeleton"></div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-muted rounded skeleton"></div>
            <div className="h-8 w-8 bg-muted rounded skeleton"></div>
            <div className="h-8 w-8 bg-muted rounded skeleton"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section Skeleton */}
        <div className="mb-8 text-center animate-slide-in-up">
          <div className="h-12 w-96 bg-muted rounded mx-auto mb-4 skeleton"></div>
          <div className="h-6 w-80 bg-muted/70 rounded mx-auto skeleton"></div>
          <div className="flex items-center justify-center mt-4">
            <div className="w-6 h-6 bg-aramco-green-400 rounded-full animate-pulse mr-2"></div>
            <div className="h-4 w-48 bg-muted/70 rounded skeleton"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 grid-animate-in">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="aramco-card-enhanced">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-20 bg-muted/70 rounded mb-2 skeleton"></div>
                    <div className="h-8 w-16 bg-muted rounded mb-1 skeleton"></div>
                    <div className="h-3 w-24 bg-muted/70 rounded skeleton"></div>
                  </div>
                  <div className="w-14 h-14 bg-muted rounded-xl skeleton"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid md:grid-cols-3 gap-8 mb-8 grid-animate-in">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="aramco-card-enhanced">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-muted rounded-2xl mx-auto mb-6 skeleton"></div>
                <div className="h-6 w-32 bg-muted rounded mx-auto mb-3 skeleton"></div>
                <div className="h-4 w-48 bg-muted/70 rounded mx-auto skeleton"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter Skeleton */}
        <div className="flex gap-4 items-center mb-6 animate-fade-in-scale">
          <div className="h-10 w-32 bg-muted rounded skeleton"></div>
          <div className="flex-1 h-10 bg-muted rounded skeleton"></div>
          <div className="h-10 w-24 bg-muted rounded skeleton"></div>
        </div>

        {/* Contracts Section Skeleton */}
        <Card className="aramco-card-enhanced">
          <div className="p-6">
            <div className="h-8 w-48 bg-muted rounded mb-2 skeleton"></div>
            <div className="h-4 w-64 bg-muted/70 rounded mb-6 skeleton"></div>
            
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-muted/30 rounded-xl border border-border">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-xl skeleton"></div>
                    <div>
                      <div className="h-5 w-32 bg-muted rounded mb-2 skeleton"></div>
                      <div className="h-3 w-24 bg-muted/70 rounded mb-2 skeleton"></div>
                      <div className="h-3 w-48 bg-muted/70 rounded skeleton"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-20 bg-muted rounded skeleton"></div>
                    <div className="h-8 w-16 bg-muted rounded skeleton"></div>
                    <div className="h-10 w-10 bg-muted rounded skeleton"></div>
                    <div className="h-10 w-10 bg-muted rounded skeleton"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
