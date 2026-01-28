"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Play,
  Terminal,
  ExternalLink,
  Check,
  Copy,
  Menu,
  X,
} from "lucide-react"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [terminalStep, setTerminalStep] = useState(0)
  const router = useRouter()

  const contractAddress = "GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R"

  const copyAddress = () => {
    navigator.clipboard.writeText(contractAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Terminal animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTerminalStep((prev) => (prev + 1) % 8)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const terminalLines = [
    { cmd: true, text: "$ trustify create-escrow --amount 2.5 --to 7xKp..." },
    { cmd: false, text: "Deriving PDA..." },
    { cmd: false, text: "✓ Escrow created at 4nFv...8kLm" },
    { cmd: false, text: "✓ 2.5 SOL locked in vault" },
    { cmd: true, text: "$ trustify release --escrow 4nFv...8kLm" },
    { cmd: false, text: "Validating work submission..." },
    { cmd: false, text: "✓ Transferring 2.5 SOL to freelancer" },
    { cmd: false, text: "✓ Escrow closed. Transaction complete." },
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-neutral-900/50 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-blue-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-bold text-sm">T</span>
              </div>
              <span className="font-semibold text-lg">Trustify</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {["How it works", "Features", "Docs"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white"
                onClick={() => router.push("/demo")}
              >
                Demo
              </Button>
              <Button
                size="sm"
                className="bg-white text-black hover:bg-neutral-200 font-medium"
                onClick={() => router.push("/dashboard/client")}
              >
                Launch App
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#09090b]">
            <div className="px-6 py-4 space-y-4">
              <Link href="#how-it-works" className="block text-neutral-400">How it works</Link>
              <Link href="#features" className="block text-neutral-400">Features</Link>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => router.push("/demo")}>Demo</Button>
                <Button className="w-full bg-white text-black" onClick={() => router.push("/dashboard/client")}>Launch App</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 md:pt-40 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-neutral-300">Live on Solana Devnet</span>
              <ArrowRight className="w-3 h-3 text-neutral-500" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Payments secured by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-500">
                smart contracts
              </span>
              <span className="text-neutral-500">,</span>
              <br />
              <span className="text-neutral-500">not promises.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed mb-10 max-w-2xl">
              Trustify is a decentralized escrow protocol on Solana. Funds are locked in a smart contract until work is verified. No intermediaries. No fees. Just code.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 h-12 px-6 font-medium text-base"
                onClick={() => router.push("/demo")}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-base"
                onClick={() => router.push("/dashboard/client")}
              >
                Start Building
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Contract address */}
            <div className="mt-10 flex items-center gap-3">
              <span className="text-sm text-neutral-500">Program ID:</span>
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors group"
              >
                <code className="text-sm text-neutral-300 font-mono">
                  {contractAddress.slice(0, 8)}...{contractAddress.slice(-8)}
                </code>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                )}
              </button>
              <a
                href={`https://explorer.solana.com/address/${contractAddress}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Preview */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl border border-white/10 bg-[#0c0c0e] overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Terminal className="w-3 h-3" />
                  trustify-cli — zsh
                </div>
              </div>
            </div>

            {/* Terminal content */}
            <div className="p-6 font-mono text-sm min-h-[280px]">
              {terminalLines.slice(0, terminalStep + 1).map((line, i) => (
                <div
                  key={i}
                  className={`${line.cmd ? "text-white" : "text-neutral-500"} ${
                    i === terminalStep ? "animate-pulse" : ""
                  }`}
                >
                  {line.text}
                </div>
              ))}
              <span className="inline-block w-2 h-4 bg-white/70 animate-pulse ml-1" />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: "~$0.00025", label: "Per transaction" },
              { value: "<400ms", label: "Finality" },
              { value: "0%", label: "Platform fee" },
              { value: "100%", label: "Non-custodial" },
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-neutral-400">
              A simple four-step process. Funds are secured by Solana smart contracts, not third parties.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Create escrow",
                desc: "Client locks SOL in a program-derived address. Only the smart contract can access these funds.",
              },
              {
                step: "02",
                title: "Accept job",
                desc: "Freelancer reviews terms and accepts. The escrow status updates on-chain.",
              },
              {
                step: "03",
                title: "Submit work",
                desc: "Freelancer completes the work and submits proof. The escrow moves to review status.",
              },
              {
                step: "04",
                title: "Release funds",
                desc: "Client approves the work. Funds transfer instantly to the freelancer. Done.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="text-xs font-mono text-neutral-600 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Bento Grid */}
      <section id="features" className="px-6 py-24 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Built different
            </h2>
            <p className="text-lg text-neutral-400">
              No middlemen. No custody. No trust required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="md:col-span-2 p-8 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Program Derived Addresses</h3>
              <p className="text-neutral-400 leading-relaxed">
                Funds are held in PDAs — deterministic addresses controlled entirely by the smart contract. No private keys. No custodians. Just cryptographic guarantees.
              </p>
            </div>

            {/* Small cards */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Instant settlement</h3>
              <p className="text-sm text-neutral-500">Funds transfer in under a second. No holds.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Access control</h3>
              <p className="text-sm text-neutral-500">Role-based permissions enforced on-chain.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Borderless</h3>
              <p className="text-sm text-neutral-500">Pay anyone, anywhere. No banks needed.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-1">Open source</h3>
              <p className="text-sm text-neutral-500">Every line of code is auditable on GitHub.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Compare the difference
            </h2>
            <p className="text-lg text-neutral-400">
              Traditional platforms vs blockchain escrow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            {/* Traditional */}
            <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01]">
              <div className="text-sm font-medium text-neutral-500 mb-6">Traditional Platforms</div>
              <ul className="space-y-4">
                {[
                  "20% platform fees",
                  "14-day payment holds",
                  "Opaque dispute process",
                  "Account freezing risk",
                  "Geographic restrictions",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-400">
                    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
                      <X className="w-3 h-3 text-neutral-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trustify */}
            <div className="p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
              <div className="text-sm font-medium text-white mb-6">Trustify</div>
              <ul className="space-y-4">
                {[
                  "~$0.00025 per transaction",
                  "Instant settlement",
                  "Transparent on-chain logic",
                  "Non-custodial — you control funds",
                  "Works globally, no restrictions",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-neutral-200">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-12 md:p-16 overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-white/10 via-transparent to-transparent blur-3xl pointer-events-none" />

            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to try trustless payments?
              </h2>
              <p className="text-lg text-neutral-400 mb-8">
                Test the full escrow flow on Solana Devnet. No real money required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-neutral-200 h-12 px-8 font-medium"
                  onClick={() => router.push("/demo")}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  onClick={() => router.push("/dashboard/client")}
                >
                  Open Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
                <span className="text-black font-bold text-xs">T</span>
              </div>
              <span className="font-medium">Trustify</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://explorer.solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Explorer
              </a>
              <span>Built on Solana</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-neutral-400">Devnet</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
