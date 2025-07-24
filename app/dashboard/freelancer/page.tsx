"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Shield,
  Search,
  Filter,
  Bookmark,
  MessageSquare,
  CreditCard,
  Settings,
  Bell,
  User,
  Star,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Eye,
  Send,
  Calendar,
  MapPin,
  Code,
  Briefcase,
  Award,
} from "lucide-react"

export default function FreelancerDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    { label: "Active Projects", value: "5", icon: Briefcase, color: "text-blue-400" },
    { label: "Total Earnings", value: "$18,750", icon: DollarSign, color: "text-green-400" },
    { label: "Completed Projects", value: "23", icon: CheckCircle, color: "text-purple-400" },
    { label: "Reputation Score", value: "4.9", icon: Star, color: "text-yellow-400" },
  ]

  const availableProjects = [
    {
      id: 1,
      title: "React Native Mobile App Development",
      client: "TechStart Inc.",
      budget: "$3,000 - $5,000",
      duration: "2-3 months",
      skills: ["React Native", "JavaScript", "Firebase"],
      description: "Looking for an experienced React Native developer to build a cross-platform mobile app...",
      posted: "2 hours ago",
      proposals: 8,
      location: "Remote",
    },
    {
      id: 2,
      title: "Smart Contract Audit & Security Review",
      client: "CryptoVault",
      budget: "$2,500 - $4,000",
      duration: "3-4 weeks",
      skills: ["Solidity", "Smart Contracts", "Security"],
      description: "Need a blockchain security expert to audit our DeFi smart contracts...",
      posted: "5 hours ago",
      proposals: 3,
      location: "Remote",
    },
    {
      id: 3,
      title: "Full-Stack Web Application",
      client: "Digital Agency Pro",
      budget: "$4,000 - $7,000",
      duration: "2-4 months",
      skills: ["Next.js", "Node.js", "PostgreSQL"],
      description: "Build a comprehensive web application with user authentication, dashboard...",
      posted: "1 day ago",
      proposals: 15,
      location: "Remote",
    },
  ]

  const activeProjects = [
    {
      id: 1,
      title: "E-commerce Dashboard",
      client: "ShopFlow",
      progress: 75,
      budget: "$4,500",
      deadline: "Dec 20, 2024",
      status: "In Progress",
    },
    {
      id: 2,
      title: "Blockchain Integration",
      client: "FinTech Solutions",
      progress: 45,
      budget: "$6,000",
      deadline: "Jan 15, 2025",
      status: "In Progress",
    },
  ]

  const recentActivity = [
    { type: "project", message: "New project match: AI Chatbot Development", time: "1 hour ago" },
    { type: "milestone", message: "Milestone completed for E-commerce Dashboard", time: "3 hours ago" },
    { type: "message", message: "New message from ShopFlow client", time: "5 hours ago" },
    { type: "payment", message: "Payment received: $1,500", time: "1 day ago" },
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
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Freelancer Dashboard</Badge>
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
                    { id: "browse", label: "Browse Projects", icon: Search },
                    { id: "projects", label: "My Projects", icon: Briefcase },
                    { id: "proposals", label: "My Proposals", icon: Send },
                    { id: "messages", label: "Messages", icon: MessageSquare },
                    { id: "earnings", label: "Earnings", icon: CreditCard },
                    { id: "profile", label: "Profile", icon: User },
                  ].map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        activeTab === item.id ? "bg-purple-500 hover:bg-purple-600" : "text-white hover:bg-white/10"
                      }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-4">
              <CardHeader>
                <CardTitle className="text-white text-sm">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">4.9/5.0 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm">Top Rated</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-white text-sm">98% Success Rate</span>
                </div>
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
                  <p className="text-white/80">Ready to find your next great project?</p>
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

                {/* Available Projects */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Recommended Projects</CardTitle>
                      <Button variant="ghost" className="text-white hover:bg-white/10">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availableProjects.slice(0, 2).map((project) => (
                        <div key={project.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-white font-semibold mb-1">{project.title}</h3>
                              <p className="text-white/60 text-sm mb-2">{project.client}</p>
                              <p className="text-white/80 text-sm line-clamp-2">{project.description}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {project.skills.map((skill) => (
                              <Badge key={skill} variant="outline" className="border-white/20 text-white/80">
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <span className="text-green-400 font-semibold">{project.budget}</span>
                              <span className="text-white/60">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {project.duration}
                              </span>
                              <span className="text-white/60">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {project.location}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-white/60">{project.proposals} proposals</span>
                              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500">
                                <Send className="w-3 h-3 mr-1" />
                                Bid
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Active Projects */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeProjects.map((project) => (
                        <div key={project.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-white font-semibold">{project.title}</h3>
                              <p className="text-white/60 text-sm">for {project.client}</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-300">{project.status}</Badge>
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
                              <span className="text-green-400">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                {project.budget}
                              </span>
                              <span className="text-white/60">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                {project.deadline}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
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
                              activity.type === "project"
                                ? "bg-blue-400"
                                : activity.type === "milestone"
                                  ? "bg-green-400"
                                  : activity.type === "message"
                                    ? "bg-orange-400"
                                    : "bg-purple-400"
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

            {activeTab === "browse" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">Browse Projects</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                      <Input
                        placeholder="Search projects..."
                        className="bg-white/10 border-white/20 text-white pl-10 w-64"
                      />
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {availableProjects.map((project) => (
                    <Card
                      key={project.id}
                      className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                            <p className="text-white/60 mb-1">Posted by {project.client}</p>
                            <p className="text-white/80 mb-3">{project.description}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                            <Bookmark className="w-5 h-5" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="border-white/20 text-white/80">
                              <Code className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm">
                            <span className="text-green-400 font-semibold text-lg">{project.budget}</span>
                            <span className="text-white/60">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {project.duration}
                            </span>
                            <span className="text-white/60">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              {project.location}
                            </span>
                            <span className="text-white/60">{project.posted}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-white/60 text-sm">{project.proposals} proposals</span>
                            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                              <Send className="w-4 h-4 mr-2" />
                              Submit Proposal
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Other tabs content would go here */}
            {!["overview", "browse"].includes(activeTab) && (
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
