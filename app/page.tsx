"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Coins,
  Target,
  Users,
  ChevronRight,
  Menu,
  X,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Zap,
  Lock,
  TrendingUp,
} from "lucide-react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [animatedNodes, setAnimatedNodes] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  const router = useRouter()

  useEffect(() => {
    // Generate floating blockchain nodes for background animation
    const nodes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setAnimatedNodes(nodes)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        {animatedNodes.map((node) => (
          <div
            key={node.id}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              animationDelay: `${node.delay}s`,
            }}
          />
        ))}
        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full">
          {animatedNodes.slice(0, 4).map((node, i) => (
            <line
              key={i}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${animatedNodes[(i + 1) % 4]?.x}%`}
              y2={`${animatedNodes[(i + 1) % 4]?.y}%`}
              stroke="rgba(168, 85, 247, 0.1)"
              strokeWidth="1"
              className="animate-pulse"
            />
          ))}
        </svg>
      </div>

      {/* Header/Navigation */}
      <header className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Trustify</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#home"
                className="text-white/80 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Home
              </Link>
              <Link
                href="#how-it-works"
                className="text-white/80 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                How It Works
              </Link>
              <Link
                href="#features"
                className="text-white/80 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-white/80 hover:text-white transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Pricing
              </Link>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => window.open("https://apps.apple.com", "_blank")}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                Download App
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.push("/auth/signin")}
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                onClick={() => router.push("/auth/signup")}
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-white/10">
              <nav className="flex flex-col space-y-4 mt-4">
                <Link href="#home" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
                  How It Works
                </Link>
                <Link href="#features" className="text-white/80 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">
                  Pricing
                </Link>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    onClick={() => router.push("/auth/signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-blue-500"
                    onClick={() => router.push("/auth/signup")}
                  >
                    Sign Up
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Zap className="w-4 h-4 mr-1" />
            Powered by Blockchain Technology
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Trustify
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Blockchain-Powered Freelancing
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Secure contracts, escrow protection, milestone payments. Experience the future of freelancing with
            transparent, trustless transactions.
          </p>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-12 max-w-2xl mx-auto border border-white/10">
            <p className="text-white/90 mb-4 font-medium">Revolutionary blockchain benefits:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Immutable Contracts
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Automated Escrow
              </div>
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                Global Payments
              </div>
            </div>
          </div>

          {/* Dual CTA */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg px-8 py-6 h-auto"
              onClick={() => router.push("/auth/signup")}
            >
              Post a Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto bg-transparent"
              onClick={() => router.push("/auth/signup")}
            >
              Find Work
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Platform Features</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Built on blockchain technology for maximum security and transparency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Contracts */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Smart Contracts</h3>
                <p className="text-white/80 leading-relaxed">
                  Automated agreement execution with built-in dispute resolution and transparent terms that execute
                  automatically when conditions are met.
                </p>
              </CardContent>
            </Card>

            {/* Escrow Protection */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Escrow Protection</h3>
                <p className="text-white/80 leading-relaxed">
                  Funds held securely until work completion with automatic release upon milestone achievement and
                  dispute protection for both parties.
                </p>
              </CardContent>
            </Card>

            {/* Milestone Tracking */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Milestone Tracking</h3>
                <p className="text-white/80 leading-relaxed">
                  Step-by-step progress monitoring with automated payments upon completion and real-time project status
                  updates.
                </p>
              </CardContent>
            </Card>

            {/* Reputation System */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Reputation System</h3>
                <p className="text-white/80 leading-relaxed">
                  Blockchain-based trust scores that are immutable and transparent, building genuine reputation over
                  time.
                </p>
              </CardContent>
            </Card>

            {/* Global Payments */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Global Payments</h3>
                <p className="text-white/80 leading-relaxed">
                  Cryptocurrency and fiat support with instant cross-border transactions and minimal fees.
                </p>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Global Community</h3>
                <p className="text-white/80 leading-relaxed">
                  Connect with talented freelancers and clients worldwide in a trusted, decentralized marketplace.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Simple 4-step process from project posting to completion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Post Project",
                description: "Create detailed project requirements with smart contract terms and milestone setup",
                icon: <Target className="w-8 h-8" />,
              },
              {
                step: "02",
                title: "Receive Proposals",
                description: "Review freelancer bids and select the best match based on skills and reputation",
                icon: <Users className="w-8 h-8" />,
              },
              {
                step: "03",
                title: "Work & Track",
                description: "Collaborate in secure workspace with milestone tracking and escrow protection",
                icon: <Shield className="w-8 h-8" />,
              },
              {
                step: "04",
                title: "Complete & Pay",
                description: "Automatic payment release upon milestone completion with reputation updates",
                icon: <Coins className="w-8 h-8" />,
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <div className="text-white">{item.icon}</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                    <span className="text-sm font-bold text-white">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              onClick={() => router.push("/how-it-works")}
            >
              Learn More About Our Process
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Trustify</span>
              </div>
              <p className="text-white/60 text-sm">The future of freelancing powered by blockchain technology.</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Dispute Resolution
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blockchain Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © 2024 Trustify. All rights reserved. Built on blockchain technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
