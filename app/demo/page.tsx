"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Shield,
  ArrowRight,
  CheckCircle,
  User,
  Briefcase,
  Lock,
  ExternalLink,
  Clock,
  Send,
  Play,
  RotateCcw,
  Zap,
  ArrowDown,
  Check,
  Copy,
  ChevronRight,
  X,
  FileCode,
  Github,
  Globe,
  Eye,
  ThumbsUp,
  MessageSquare,
  Terminal,
  Box,
} from "lucide-react"

const generateAddress = () => {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

const generateTxHash = () => {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  return Array.from({ length: 88 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

const formatAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`

interface LogLine {
  text: string
  type: "info" | "success" | "warning" | "command"
}

interface Transaction {
  id: string
  type: string
  from: string
  to: string
  amount?: number
  hash: string
  slot: number
  fee: number
}

interface Deliverable {
  name: string
  type: string
  url: string
}

export default function DemoPage() {
  const [mounted, setMounted] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [introStep, setIntroStep] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [terminalLines, setTerminalLines] = useState<LogLine[]>([])
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [showWorkModal, setShowWorkModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Addresses
  const [clientAddress] = useState(generateAddress())
  const [freelancerAddress] = useState(generateAddress())
  const [escrowAddress] = useState(generateAddress())
  const [programId] = useState("GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R")

  // Balances
  const [clientBalance, setClientBalance] = useState(12.5)
  const [freelancerBalance, setFreelancerBalance] = useState(0.75)
  const [escrowBalance, setEscrowBalance] = useState(0)

  // Project
  const projectAmount = 2.5
  const projectTitle = "E-commerce Platform Development"
  const projectDescription = "Build a modern e-commerce platform with React, Node.js, and PostgreSQL."

  // Deliverables (submitted by freelancer)
  const deliverables: Deliverable[] = [
    { name: "Frontend Repository", type: "github", url: "github.com/bob/ecommerce-frontend" },
    { name: "Backend API", type: "github", url: "github.com/bob/ecommerce-api" },
    { name: "Live Demo", type: "website", url: "ecommerce-demo.vercel.app" },
    { name: "Documentation", type: "file", url: "docs.google.com/..." },
  ]

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [animatingFunds, setAnimatingFunds] = useState<"to-escrow" | "to-freelancer" | null>(null)
  const [currentSlot, setCurrentSlot] = useState(245892341)

  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const addTerminalLine = (text: string, type: LogLine["type"] = "info") => {
    setTerminalLines(prev => [...prev, { text, type }])
  }

  const simulateBlockchain = async (commands: { text: string; type: LogLine["type"]; delay?: number }[]): Promise<string> => {
    setTerminalLines([])

    for (const cmd of commands) {
      addTerminalLine(cmd.text, cmd.type)
      await new Promise(r => setTimeout(r, cmd.delay || 80 + Math.random() * 40))
    }

    const newSlot = currentSlot + Math.floor(Math.random() * 5) + 1
    setCurrentSlot(newSlot)

    return generateTxHash()
  }

  const addTransaction = (tx: Omit<Transaction, "id" | "slot" | "fee">) => {
    const newTx: Transaction = {
      ...tx,
      id: Date.now().toString(),
      slot: currentSlot,
      fee: 0.000005
    }
    setTransactions(prev => [...prev, newTx])
  }

  // Step 1: Create Escrow
  const handleCreateEscrow = async () => {
    setIsProcessing(true)

    const txHash = await simulateBlockchain([
      { text: "$ solana config get", type: "command" },
      { text: "RPC URL: https://api.devnet.solana.com", type: "info" },
      { text: "Keypair: /Users/alice/.config/solana/id.json", type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "$ anchor idl fetch GwMcGox...", type: "command" },
      { text: "Fetching IDL for program GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R", type: "info" },
      { text: "IDL found. 6 instructions available.", type: "success" },
      { text: "", type: "info", delay: 30 },
      { text: "$ trustify create-escrow --amount 2.5 --desc \"E-commerce...\"", type: "command" },
      { text: "Deriving escrow PDA...", type: "info" },
      { text: `  Seeds: ["escrow", ${formatAddress(clientAddress)}, 1706892341]`, type: "info" },
      { text: `  PDA: ${formatAddress(escrowAddress)}`, type: "info" },
      { text: `  Bump: 254`, type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Building transaction...", type: "info" },
      { text: "  Instruction: create_escrow", type: "info" },
      { text: "  Amount: 2,500,000,000 lamports", type: "info" },
      { text: "  Rent: 2,039,280 lamports", type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Requesting signature from wallet...", type: "warning" },
      { text: "Signature received ✓", type: "success", delay: 200 },
      { text: "", type: "info", delay: 50 },
      { text: "Sending transaction to cluster...", type: "info" },
      { text: `  Slot: ${currentSlot}`, type: "info" },
      { text: "  Confirmations: 1/32", type: "info", delay: 80 },
      { text: "  Confirmations: 16/32", type: "info", delay: 80 },
      { text: "  Confirmations: 32/32", type: "info", delay: 80 },
      { text: "", type: "info", delay: 30 },
      { text: "Transaction confirmed!", type: "success" },
      { text: `  Signature: ${generateTxHash().slice(0, 44)}...`, type: "info" },
      { text: "  Fee: 0.000005 SOL", type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Escrow created successfully. Funds locked in PDA vault.", type: "success" },
    ])

    setAnimatingFunds("to-escrow")
    await new Promise(r => setTimeout(r, 400))

    setClientBalance(prev => prev - projectAmount)
    setEscrowBalance(projectAmount)
    setAnimatingFunds(null)

    addTransaction({
      type: "create_escrow",
      from: clientAddress,
      to: escrowAddress,
      amount: projectAmount,
      hash: txHash
    })

    setIsProcessing(false)
    setCurrentStep(1)
  }

  // Step 2: Accept Escrow
  const handleAcceptEscrow = async () => {
    setIsProcessing(true)

    const txHash = await simulateBlockchain([
      { text: "$ trustify accept-escrow --escrow " + formatAddress(escrowAddress), type: "command" },
      { text: "", type: "info", delay: 30 },
      { text: "Fetching escrow account...", type: "info" },
      { text: `  Client: ${formatAddress(clientAddress)}`, type: "info" },
      { text: "  Freelancer: null", type: "info" },
      { text: "  Amount: 2.5 SOL", type: "info" },
      { text: "  Status: Open", type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Validating...", type: "info" },
      { text: "  ✓ Escrow is Open", type: "success" },
      { text: "  ✓ Caller is not client", type: "success" },
      { text: "", type: "info", delay: 30 },
      { text: "Building transaction...", type: "info" },
      { text: "  Instruction: accept_escrow", type: "info" },
      { text: `  Freelancer: ${formatAddress(freelancerAddress)}`, type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Requesting signature from wallet...", type: "warning" },
      { text: "Signature received ✓", type: "success", delay: 150 },
      { text: "", type: "info", delay: 30 },
      { text: "Sending transaction to cluster...", type: "info" },
      { text: "  Confirmations: 32/32", type: "info", delay: 120 },
      { text: "", type: "info", delay: 30 },
      { text: "Transaction confirmed!", type: "success" },
      { text: "", type: "info", delay: 30 },
      { text: "Escrow accepted. Status updated to InProgress.", type: "success" },
    ])

    addTransaction({
      type: "accept_escrow",
      from: freelancerAddress,
      to: escrowAddress,
      hash: txHash
    })

    setIsProcessing(false)
    setCurrentStep(2)
  }

  // Step 3: Submit Work
  const handleSubmitWork = async () => {
    setShowWorkModal(false)
    setIsProcessing(true)

    const txHash = await simulateBlockchain([
      { text: "$ trustify submit-work --escrow " + formatAddress(escrowAddress), type: "command" },
      { text: "", type: "info", delay: 30 },
      { text: "Fetching escrow account...", type: "info" },
      { text: "  Status: InProgress", type: "info" },
      { text: `  Freelancer: ${formatAddress(freelancerAddress)}`, type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Validating...", type: "info" },
      { text: "  ✓ Escrow is InProgress", type: "success" },
      { text: "  ✓ Caller is assigned freelancer", type: "success" },
      { text: "", type: "info", delay: 30 },
      { text: "Building transaction...", type: "info" },
      { text: "  Instruction: submit_work", type: "info" },
      { text: "  New status: Submitted", type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Requesting signature from wallet...", type: "warning" },
      { text: "Signature received ✓", type: "success", delay: 150 },
      { text: "", type: "info", delay: 30 },
      { text: "Sending transaction to cluster...", type: "info" },
      { text: "  Confirmations: 32/32", type: "info", delay: 120 },
      { text: "", type: "info", delay: 30 },
      { text: "Transaction confirmed!", type: "success" },
      { text: "", type: "info", delay: 30 },
      { text: "Work submitted. Waiting for client approval.", type: "success" },
    ])

    addTransaction({
      type: "submit_work",
      from: freelancerAddress,
      to: escrowAddress,
      hash: txHash
    })

    setIsProcessing(false)
    setCurrentStep(3)
  }

  // Step 4: Release Funds
  const handleReleaseFunds = async () => {
    setShowReviewModal(false)
    setIsProcessing(true)

    const txHash = await simulateBlockchain([
      { text: "$ trustify release-funds --escrow " + formatAddress(escrowAddress), type: "command" },
      { text: "", type: "info", delay: 30 },
      { text: "Fetching escrow account...", type: "info" },
      { text: "  Status: Submitted", type: "info" },
      { text: "  Amount: 2.5 SOL", type: "info" },
      { text: `  Freelancer: ${formatAddress(freelancerAddress)}`, type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Validating...", type: "info" },
      { text: "  ✓ Escrow is Submitted", type: "success" },
      { text: "  ✓ Caller is client", type: "success" },
      { text: "", type: "info", delay: 30 },
      { text: "Building transaction...", type: "info" },
      { text: "  Instruction: release_funds", type: "info" },
      { text: "  Transfer: 2,500,000,000 lamports", type: "info" },
      { text: `  From: ${formatAddress(escrowAddress)} (PDA)`, type: "info" },
      { text: `  To: ${formatAddress(freelancerAddress)}`, type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Requesting signature from wallet...", type: "warning" },
      { text: "Signature received ✓", type: "success", delay: 150 },
      { text: "", type: "info", delay: 30 },
      { text: "Sending transaction to cluster...", type: "info" },
      { text: "  Confirmations: 32/32", type: "info", delay: 120 },
      { text: "", type: "info", delay: 30 },
      { text: "Transferring 2.5 SOL to freelancer...", type: "info", delay: 100 },
      { text: "Transfer complete ✓", type: "success" },
      { text: "", type: "info", delay: 30 },
      { text: "Closing escrow account...", type: "info" },
      { text: "Rent returned to client: 0.00203928 SOL", type: "info" },
      { text: "", type: "info", delay: 30 },
      { text: "Transaction confirmed!", type: "success" },
      { text: "", type: "info", delay: 30 },
      { text: "Payment released successfully. Escrow closed.", type: "success" },
    ])

    setAnimatingFunds("to-freelancer")
    await new Promise(r => setTimeout(r, 400))

    setEscrowBalance(0)
    setFreelancerBalance(prev => prev + projectAmount)
    setAnimatingFunds(null)

    addTransaction({
      type: "release_funds",
      from: escrowAddress,
      to: freelancerAddress,
      amount: projectAmount,
      hash: txHash
    })

    setIsProcessing(false)
    setCurrentStep(4)
  }

  const resetDemo = () => {
    setShowIntro(true)
    setIntroStep(0)
    setCurrentStep(0)
    setTransactions([])
    setTerminalLines([])
    setClientBalance(12.5)
    setFreelancerBalance(0.75)
    setEscrowBalance(0)
    setIsProcessing(false)
    setAnimatingFunds(null)
  }

  if (!mounted) return null

  // Intro Story
  if (showIntro) {
    const introSteps = [
      {
        title: "Meet the Players",
        content: (
          <div className="space-y-8">
            <div className="flex items-start gap-6 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">A</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Alice — The Client</h3>
                <p className="text-neutral-400">
                  Alice runs a small business and needs an e-commerce platform built.
                  She has <span className="text-white font-mono">12.5 SOL</span> in her wallet and wants to hire a developer.
                </p>
                <p className="text-neutral-500 text-sm mt-2 font-mono">
                  Wallet: {formatAddress(clientAddress)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Bob — The Freelancer</h3>
                <p className="text-neutral-400">
                  Bob is a full-stack developer looking for work.
                  He has <span className="text-white font-mono">0.75 SOL</span> and is ready to take on new projects.
                </p>
                <p className="text-neutral-500 text-sm mt-2 font-mono">
                  Wallet: {formatAddress(freelancerAddress)}
                </p>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "The Problem",
        content: (
          <div className="space-y-6">
            <p className="text-xl text-neutral-300 leading-relaxed">
              Alice wants to hire Bob, but they've never met. She's worried:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <X className="w-5 h-5 text-red-400 mt-0.5" />
                <p className="text-neutral-300">"What if I pay upfront and Bob disappears with my money?"</p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <X className="w-5 h-5 text-red-400 mt-0.5" />
                <p className="text-neutral-300">"What if Bob does the work and I refuse to pay?"</p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <X className="w-5 h-5 text-red-400 mt-0.5" />
                <p className="text-neutral-300">"Traditional escrow services take 20% and hold money for weeks."</p>
              </div>
            </div>
            <p className="text-lg text-neutral-400 pt-4">
              They need a way to work together <span className="text-white">without trusting each other</span>.
            </p>
          </div>
        )
      },
      {
        title: "The Solution: Trustify",
        content: (
          <div className="space-y-6">
            <p className="text-xl text-neutral-300 leading-relaxed">
              A smart contract holds the funds. No human middleman. Just code.
            </p>

            <div className="flex items-center justify-between p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-white">A</span>
                </div>
                <p className="text-sm text-neutral-400">Alice</p>
              </div>
              <ArrowRight className="w-6 h-6 text-neutral-600" />
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-neutral-700 border-2 border-neutral-600 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-neutral-400">Smart Contract</p>
              </div>
              <ArrowRight className="w-6 h-6 text-neutral-600" />
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold text-white">B</span>
                </div>
                <p className="text-sm text-neutral-400">Bob</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-neutral-900 rounded-xl">
                <p className="text-2xl font-bold text-white">~0.4s</p>
                <p className="text-sm text-neutral-500">Settlement</p>
              </div>
              <div className="text-center p-4 bg-neutral-900 rounded-xl">
                <p className="text-2xl font-bold text-white">$0.00025</p>
                <p className="text-sm text-neutral-500">Total fees</p>
              </div>
              <div className="text-center p-4 bg-neutral-900 rounded-xl">
                <p className="text-2xl font-bold text-white">0%</p>
                <p className="text-sm text-neutral-500">Platform cut</p>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Ready to Watch?",
        content: (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto">
              <Play className="w-12 h-12 text-white" />
            </div>
            <p className="text-xl text-neutral-300">
              You're about to watch a complete escrow transaction unfold.
            </p>
            <p className="text-neutral-500">
              Alice will create an escrow, Bob will accept and deliver work,
              and Alice will release payment — all secured by blockchain.
            </p>
            <div className="pt-4">
              <p className="text-sm text-neutral-600">
                This is a simulation. No real money is involved.
              </p>
            </div>
          </div>
        )
      }
    ]

    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {introSteps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === introStep ? "bg-white w-6" : i < introStep ? "bg-white/50" : "bg-neutral-700"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">{introSteps[introStep].title}</h2>
            {introSteps[introStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={() => setIntroStep(prev => prev - 1)}
              disabled={introStep === 0}
              variant="ghost"
              className="text-neutral-400 hover:text-white disabled:opacity-0"
            >
              Back
            </Button>

            {introStep < introSteps.length - 1 ? (
              <Button
                onClick={() => setIntroStep(prev => prev + 1)}
                className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowIntro(false)}
                className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Demo
              </Button>
            )}
          </div>

          {/* Skip */}
          <div className="text-center mt-6">
            <button
              onClick={() => setShowIntro(false)}
              className="text-neutral-600 hover:text-neutral-400 text-sm"
            >
              Skip intro
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Work Submission Modal
  if (showWorkModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">B</span>
              </div>
              <div>
                <h3 className="font-semibold">Bob is submitting work</h3>
                <p className="text-neutral-500 text-sm">Review deliverables before submission</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm text-neutral-500 mb-2 block">Deliverables</label>
              <div className="space-y-2">
                {deliverables.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-neutral-800 rounded-xl">
                    {d.type === "github" && <Github className="w-5 h-5 text-neutral-400" />}
                    {d.type === "website" && <Globe className="w-5 h-5 text-neutral-400" />}
                    {d.type === "file" && <FileCode className="w-5 h-5 text-neutral-400" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-neutral-500 font-mono">{d.url}</p>
                    </div>
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-500 mb-2 block">Message to client</label>
              <div className="p-4 bg-neutral-800 rounded-xl text-sm text-neutral-300">
                "Hi Alice! I've completed the e-commerce platform as requested. All features are implemented and tested.
                Please review the live demo and let me know if you need any changes!"
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-800 flex gap-3">
            <Button
              onClick={() => setShowWorkModal(false)}
              variant="outline"
              className="flex-1 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitWork}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Work
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Review Modal
  if (showReviewModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <div>
                <h3 className="font-semibold">Alice is reviewing work</h3>
                <p className="text-neutral-500 text-sm">Verify deliverables before releasing payment</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Deliverables */}
            <div>
              <label className="text-sm text-neutral-500 mb-3 block">Submitted Deliverables</label>
              <div className="grid grid-cols-2 gap-3">
                {deliverables.map((d, i) => (
                  <div key={i} className="p-4 bg-neutral-800 rounded-xl hover:bg-neutral-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      {d.type === "github" && <Github className="w-5 h-5 text-neutral-400" />}
                      {d.type === "website" && <Globe className="w-5 h-5 text-neutral-400" />}
                      {d.type === "file" && <FileCode className="w-5 h-5 text-neutral-400" />}
                      <p className="font-medium text-sm">{d.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 font-mono truncate">{d.url}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm text-neutral-500 mb-2 block">Message from Bob</label>
              <div className="p-4 bg-neutral-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">B</span>
                  </div>
                  <p className="text-sm text-neutral-300">
                    "Hi Alice! I've completed the e-commerce platform as requested. All features are implemented and tested.
                    Please review the live demo and let me know if you need any changes!"
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium text-green-400">Ready to release</p>
                    <p className="text-sm text-green-400/70">Funds will transfer instantly</p>
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-green-400">{projectAmount} SOL</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-neutral-800 flex gap-3">
            <Button
              onClick={() => setShowReviewModal(false)}
              variant="outline"
              className="flex-1 border-neutral-700 text-white hover:bg-neutral-800 bg-transparent"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Request Changes
            </Button>
            <Button
              onClick={handleReleaseFunds}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Approve & Release
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Processing Modal
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-5 h-5 text-neutral-500" />
            <span className="text-neutral-500 text-sm font-mono">solana-cli v1.17.0</span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-500 text-sm font-mono">cluster: devnet</span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-500 text-sm font-mono">slot: {currentSlot.toLocaleString()}</span>
          </div>

          <div
            ref={terminalRef}
            className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 font-mono text-sm h-[400px] overflow-y-auto"
          >
            {terminalLines.map((line, i) => (
              <div key={i} className={`${
                line.type === "command" ? "text-yellow-400" :
                line.type === "success" ? "text-green-400" :
                line.type === "warning" ? "text-orange-400" :
                "text-neutral-400"
              } ${line.text === "" ? "h-2" : ""}`}>
                {line.text}
              </div>
            ))}
            <div className="flex items-center gap-2 text-green-400 mt-2">
              <div className="w-2 h-4 bg-green-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Demo UI
  const steps = [
    { title: "Create Escrow", actor: "client" },
    { title: "Accept Job", actor: "freelancer" },
    { title: "Submit Work", actor: "freelancer" },
    { title: "Release Funds", actor: "client" },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Trustify</span>
              </Link>
              <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                Live Demo
              </span>
            </div>
            <Button onClick={resetDemo} variant="ghost" className="text-neutral-400 hover:text-white">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    currentStep > i ? "bg-green-500 text-white" :
                    currentStep === i ? step.actor === "client" ? "bg-blue-500 text-white" : "bg-emerald-500 text-white" :
                    "bg-neutral-800 text-neutral-500"
                  }`}>
                    {currentStep > i ? <Check className="w-6 h-6" /> : i + 1}
                  </div>
                  <p className={`text-xs mt-2 font-medium ${currentStep >= i ? "text-white" : "text-neutral-600"}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${currentStep >= i ? "text-neutral-500" : "text-neutral-700"}`}>
                    {step.actor === "client" ? "Alice" : "Bob"}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-3 mt-[-24px] ${currentStep > i ? "bg-green-500" : "bg-neutral-800"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Actors */}
          <div className="space-y-4">
            {/* Alice */}
            <div className={`rounded-2xl border-2 transition-all ${
              (currentStep === 0 || currentStep === 3) ? "bg-blue-500/5 border-blue-500/30" : "bg-neutral-900 border-neutral-800"
            }`}>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    (currentStep === 0 || currentStep === 3) ? "bg-gradient-to-br from-blue-400 to-blue-600" : "bg-neutral-800"
                  }`}>
                    <span className={`text-lg font-bold ${(currentStep === 0 || currentStep === 3) ? "text-white" : "text-neutral-400"}`}>A</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Alice</h3>
                    <p className="text-sm text-neutral-500">Client</p>
                  </div>
                  {(currentStep === 0 || currentStep === 3) && (
                    <span className="ml-auto px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">Your turn</span>
                  )}
                </div>

                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-500 text-sm">Balance</span>
                    <span className={`font-mono text-lg font-bold ${animatingFunds === "to-escrow" ? "text-red-400" : ""}`}>
                      {clientBalance.toFixed(4)} SOL
                    </span>
                  </div>
                  <button onClick={() => copyToClipboard(clientAddress)} className="text-xs font-mono text-neutral-600 hover:text-neutral-400">
                    {formatAddress(clientAddress)}
                    {copiedText === clientAddress && <Check className="w-3 h-3 inline ml-1 text-green-500" />}
                  </button>
                </div>

                {currentStep === 0 && (
                  <Button onClick={handleCreateEscrow} className="w-full bg-blue-500 hover:bg-blue-600 text-white h-11">
                    <Lock className="w-4 h-4 mr-2" />
                    Create Escrow ({projectAmount} SOL)
                  </Button>
                )}

                {currentStep === 3 && (
                  <Button onClick={() => setShowReviewModal(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white h-11">
                    <Eye className="w-4 h-4 mr-2" />
                    Review Submitted Work
                  </Button>
                )}

                {(currentStep === 1 || currentStep === 2) && (
                  <div className="text-center py-2 text-neutral-500 text-sm">Waiting for Bob...</div>
                )}

                {currentStep === 4 && (
                  <div className="flex items-center justify-center gap-2 py-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Done</span>
                  </div>
                )}
              </div>
            </div>

            {/* Animated Arrow */}
            {animatingFunds && (
              <div className="flex justify-center py-2">
                <div className={`p-2 rounded-full ${animatingFunds === "to-escrow" ? "bg-blue-500" : "bg-green-500"} animate-bounce`}>
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Escrow */}
            <div className={`rounded-2xl border-2 transition-all ${
              escrowBalance > 0 ? "bg-neutral-800 border-neutral-600" : "bg-neutral-900 border-neutral-800"
            }`}>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    escrowBalance > 0 ? "bg-neutral-100 text-neutral-900" : "bg-neutral-800 text-neutral-500"
                  }`}>
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Escrow Vault</h3>
                    <p className="text-sm text-neutral-500">Smart Contract</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-500 text-sm">Locked</span>
                    <span className={`font-mono text-lg font-bold ${
                      animatingFunds ? "text-yellow-400" : escrowBalance > 0 ? "text-white" : "text-neutral-600"
                    }`}>
                      {escrowBalance.toFixed(4)} SOL
                    </span>
                  </div>
                  <button onClick={() => copyToClipboard(escrowAddress)} className="text-xs font-mono text-neutral-600 hover:text-neutral-400">
                    {formatAddress(escrowAddress)}
                  </button>
                </div>

                {escrowBalance > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                    <p className="text-yellow-400 text-xs">Secured by program {formatAddress(programId)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bob */}
            <div className={`rounded-2xl border-2 transition-all ${
              (currentStep === 1 || currentStep === 2) ? "bg-emerald-500/5 border-emerald-500/30" : "bg-neutral-900 border-neutral-800"
            }`}>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    (currentStep === 1 || currentStep === 2) ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-neutral-800"
                  }`}>
                    <span className={`text-lg font-bold ${(currentStep === 1 || currentStep === 2) ? "text-white" : "text-neutral-400"}`}>B</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Bob</h3>
                    <p className="text-sm text-neutral-500">Freelancer</p>
                  </div>
                  {(currentStep === 1 || currentStep === 2) && (
                    <span className="ml-auto px-2 py-1 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">Your turn</span>
                  )}
                </div>

                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-500 text-sm">Balance</span>
                    <span className={`font-mono text-lg font-bold ${animatingFunds === "to-freelancer" ? "text-green-400" : ""}`}>
                      {freelancerBalance.toFixed(4)} SOL
                    </span>
                  </div>
                  <button onClick={() => copyToClipboard(freelancerAddress)} className="text-xs font-mono text-neutral-600 hover:text-neutral-400">
                    {formatAddress(freelancerAddress)}
                  </button>
                </div>

                {currentStep === 0 && (
                  <div className="text-center py-2 text-neutral-500 text-sm">Waiting for job...</div>
                )}

                {currentStep === 1 && (
                  <Button onClick={handleAcceptEscrow} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Job
                  </Button>
                )}

                {currentStep === 2 && (
                  <Button onClick={() => setShowWorkModal(true)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-11">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Work
                  </Button>
                )}

                {currentStep === 3 && (
                  <div className="text-center py-2 text-neutral-500 text-sm">Waiting for approval...</div>
                )}

                {currentStep === 4 && (
                  <div className="flex items-center justify-center gap-2 py-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">+{projectAmount} SOL</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center - Project + State */}
          <div className="space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="p-5 border-b border-neutral-800">
                <h2 className="font-semibold">Project</h2>
              </div>
              <div className="p-5">
                <h3 className="font-semibold mb-2">{projectTitle}</h3>
                <p className="text-neutral-500 text-sm mb-4">{projectDescription}</p>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-neutral-800">
                    <span className="text-neutral-500">Budget</span>
                    <span className="font-mono font-bold">{projectAmount} SOL</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-neutral-800">
                    <span className="text-neutral-500">Platform Fee</span>
                    <span className="text-green-400 font-mono">0%</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-500">Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      currentStep === 0 ? "bg-neutral-800 text-neutral-400" :
                      currentStep === 1 ? "bg-blue-500/20 text-blue-400" :
                      currentStep === 2 ? "bg-yellow-500/20 text-yellow-400" :
                      currentStep === 3 ? "bg-orange-500/20 text-orange-400" :
                      "bg-green-500/20 text-green-400"
                    }`}>
                      {["Pending", "Open", "In Progress", "Under Review", "Completed"][currentStep]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl">
              <div className="p-5 border-b border-neutral-800 flex items-center gap-2">
                <Box className="w-4 h-4 text-neutral-500" />
                <h2 className="font-semibold">On-Chain State</h2>
              </div>
              <div className="p-5 font-mono text-xs space-y-1">
                <div className="flex justify-between"><span className="text-neutral-600">client:</span><span>{currentStep >= 1 ? formatAddress(clientAddress) : "—"}</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">freelancer:</span><span>{currentStep >= 2 ? formatAddress(freelancerAddress) : "null"}</span></div>
                <div className="flex justify-between"><span className="text-neutral-600">amount:</span><span>{currentStep >= 1 ? `${(projectAmount * 1e9).toLocaleString()} lamports` : "0"}</span></div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">status:</span>
                  <span className={
                    currentStep === 1 ? "text-blue-400" :
                    currentStep === 2 ? "text-yellow-400" :
                    currentStep === 3 ? "text-purple-400" :
                    currentStep === 4 ? "text-green-400" : "text-neutral-600"
                  }>
                    {["—", "Open", "InProgress", "Submitted", "Completed"][currentStep]}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-neutral-600">bump:</span><span>{currentStep >= 1 ? "254" : "—"}</span></div>
              </div>
            </div>
          </div>

          {/* Right - Transactions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl h-fit">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="font-semibold">Transactions</h2>
              <span className="text-xs text-neutral-500">{transactions.length}</span>
            </div>
            <div className="p-5 max-h-[400px] overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-neutral-600">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{tx.type}</span>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Confirmed
                        </span>
                      </div>
                      {tx.amount && (
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-neutral-500">Amount</span>
                          <span className="font-mono">{tx.amount} SOL</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-500">Fee</span>
                        <span className="font-mono text-neutral-400">{tx.fee} SOL</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Slot</span>
                        <span className="font-mono text-neutral-400">{tx.slot.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-neutral-700/50">
                        <button className="text-xs text-neutral-500 hover:text-white font-mono flex items-center gap-1">
                          {tx.hash.slice(0, 16)}... <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completion */}
        {currentStep === 4 && (
          <div className="mt-10 max-w-xl mx-auto text-center">
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Transaction Complete</h2>
              <p className="text-neutral-400 mb-6">
                {projectAmount} SOL transferred instantly. Zero platform fees. No middleman.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={resetDemo} variant="outline" className="border-neutral-700 bg-transparent text-white hover:bg-neutral-800">
                  <RotateCcw className="w-4 h-4 mr-2" /> Run Again
                </Button>
                <Link href="/dashboard/client">
                  <Button className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200">
                    Try Real App <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
