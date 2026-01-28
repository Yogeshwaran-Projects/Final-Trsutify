"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Wallet,
  Lock,
  ArrowRight,
  CheckCircle,
  User,
  Play,
} from "lucide-react"
import { EscrowFlowStatic } from "@/components/EscrowFlow"

export default function HowItWorksPage() {
  const steps = [
    {
      step: 1,
      title: "Client Creates Escrow",
      description: "The client deposits SOL into a secure smart contract vault. Funds are locked and can only be released by the client.",
      icon: Wallet,
      color: "from-blue-500 to-blue-600",
    },
    {
      step: 2,
      title: "Freelancer Accepts Task",
      description: "A freelancer reviews the task and accepts it. The escrow status changes to 'In Progress' and work begins.",
      icon: User,
      color: "from-purple-500 to-purple-600",
    },
    {
      step: 3,
      title: "Work is Submitted",
      description: "The freelancer completes the work and submits it for review. The escrow status changes to 'Submitted'.",
      icon: CheckCircle,
      color: "from-yellow-500 to-orange-500",
    },
    {
      step: 4,
      title: "Funds Released",
      description: "The client approves the work and releases funds. SOL is automatically transferred from the vault to the freelancer.",
      icon: ArrowRight,
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Trustify</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/demo">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
                  <Play className="w-4 h-4 mr-2" />
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            How It Works
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Trustless Escrow on Solana
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Your funds are secured by smart contract code, not a company.
            See how the escrow flow works step by step.
          </p>
        </div>

        {/* Flow Visualization */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="py-8">
              <EscrowFlowStatic />
            </CardContent>
          </Card>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto space-y-8 mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-white/50 text-sm">Step {step.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-white/70">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Why PDA Escrow?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6 text-center">
                <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Secure Vault</h3>
                <p className="text-white/70 text-sm">
                  Funds are held in a Program Derived Address controlled by the smart contract
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Access Control</h3>
                <p className="text-white/70 text-sm">
                  Only the client can release funds, only the freelancer can accept tasks
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Transparent</h3>
                <p className="text-white/70 text-sm">
                  All transactions are on-chain and verifiable on Solana Explorer
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Try It?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                <Play className="w-5 h-5 mr-2" />
                Try Live Demo
              </Button>
            </Link>
            <Link href="/dashboard/client">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                Client Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
