"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Plus,
  FolderOpen,
  MessageSquare,
  CreditCard,
  Settings,
  Bell,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Eye,
  User,
  Calendar,
} from "lucide-react"

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  const stats = [
    { label: "Active Projects", value: "8", icon: FolderOpen, color: "text-blue-400" },
    { label: "Total Spent", value: "$24,500", icon: DollarSign, color: "text-green-400" },
    { label: "Completed Projects", value: "15", icon: CheckCircle, color: "text-purple-400" },
    { label: "Active Freelancers", value: "12", icon: Users, color: "text-orange-400" },
  ]

  const recentProjects = [
    {
      id: 1,
      title: "E-commerce Website Development",
      freelancer: "Sarah Johnson",
      status: "In Progress",
      progress: 65,
      budget: "$5,000",
      deadline: "Dec 15, 2024",
      milestones: { completed: 2, total: 4 },
    },
    {
      id: 2,
      title: "Mobile App UI/UX Design",
      freelancer: "Mike Chen",
      status: "Review",
      progress: 90,
      budget: "$3,200",
      deadline: "Dec 10, 2024",
      milestones: { completed: 3, total: 3 },
    },
    {
      id: 3,
      title: "Smart Contract Development",
      freelancer: "Alex Rodriguez",
      status: "In Progress",
      progress: 40,
      budget: "$8,000",
      deadline: "Jan 20, 2025",
      milestones: { completed: 1, total: 5 },
    },
  ]

  const recentActivity = [
    { type: "milestone", message: "Milestone 2 completed for E-commerce Website", time: "2 hours ago" },
    { type: "proposal", message: "New proposal received for Blockchain Integration", time: "4 hours ago" },
    { type: "payment", message: "Payment released for Mobile App Design", time: "1 day ago" },
    { type: "message", message: "New message from Sarah Johnson", time: "2 days ago" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Trustify</span>
              </Link>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Client Dashboard</Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {[
                    { id: "overview", label: "Dashboard", icon: TrendingUp },
                    { id: "projects", label: "My Projects", icon: FolderOpen },
                    { id: "post", label: "Post Project", icon: Plus },
                    { id: "messages", label: "Messages", icon: MessageSquare },
                    { id: "payments", label: "Payments", icon: CreditCard },
                    { id: "settings", label: "Settings", icon: Settings },
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeTab === item.id ? "bg-purple-500 hover:bg-purple-600" : "text-white hover:bg-white/10"
                      }`}
                      onClick={() => {
                        if (item.id === "post") {
                          router.push("/dashboard/client/post-project")
                        } else {
                          setActiveTab(item.id)
                        }
                      }}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-4">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  onClick={() => router.push("/dashboard/client/post-project")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Project
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => setActiveTab("projects")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Applications
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => setActiveTab("payments")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Release Payments
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Welcome */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Welcome back, XYZ!</h1>
                  <p className="text-white/80">Here's what's happening with your projects today.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                          </div>
                          <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Projects */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Recent Projects</CardTitle>
                      <Button variant="ghost" className="text-white hover:bg-white/10">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div key={project.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-white font-semibold">{project.title}</h3>
                              <p className="text-white/60 text-sm">with {project.freelancer}</p>
                            </div>
                            <Badge
                              variant={project.status === "In Progress" ? "default" : "secondary"}
                              className={
                                project.status === "In Progress"
                                  ? "bg-blue-500/20 text-blue-300"
                                  : "bg-green-500/20 text-green-300"
                              }
                            >
                              {project.status}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Progress</span>
                              <span className="text-white">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <span className="text-white/60">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                {project.budget}
                              </span>
                              <span className="text-white/60">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {project.deadline}
                              </span>
                            </div>
                            <span className="text-white/60">
                              {project.milestones.completed}/{project.milestones.total} milestones
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              activity.type === "milestone"
                                ? "bg-green-400"
                                : activity.type === "proposal"
                                  ? "bg-blue-400"
                                  : activity.type === "payment"
                                    ? "bg-purple-400"
                                    : "bg-orange-400"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-white text-sm">{activity.message}</p>
                            <p className="text-white/60 text-xs">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other tabs content would go here */}
            {activeTab !== "overview" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                </h2>
                <p className="text-white/60">This section is under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
