"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Space_Grotesk } from "next/font/google"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] })
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { EscrowFlow } from "@/components/EscrowFlow"
import type { EscrowStatus } from "@/lib/solana"
import {
  ArrowRight,
  Play,
  Copy,
  Check,
  Package,
  Component,
  RefreshCw,
  Menu,
  X,
  Zap,
  Database,
  Globe,
  FileCode,
  Server,
  Shield,
  Cloud,
  Terminal,
  Code2,
  Layers,
} from "lucide-react"

// ============================================
// SECTION 1: Hero — Animated Architecture Map
// ============================================

const ARCH_NODES: Record<string, { label: string; sub: string; icon: typeof Globe; color: string }> = {
  frontend: { label: "Next.js Frontend", sub: "User Interface",   icon: Globe,   color: "#3b82f6" },
  helius:   { label: "Helius RPC",       sub: "Solana Gateway",   icon: Zap,     color: "#f97316" },
  program:  { label: "Solana Program",   sub: "Smart Contract",   icon: Shield,  color: "#a855f7" },
  pinata:   { label: "Pinata IPFS",      sub: "Off-chain Storage", icon: Cloud,   color: "#ec4899" },
  receiver: { label: "Receiver SDK",     sub: "Integration Layer", icon: Package, color: "#22c55e" },
}

const ARCH_EDGES = [
  { from: "frontend", to: "helius" },
  { from: "frontend", to: "program" },
  { from: "frontend", to: "pinata" },
  { from: "helius",   to: "program" },
  { from: "program",  to: "receiver" },
]

interface LineData { x1: number; y1: number; x2: number; y2: number; fc: string; tc: string }

function ArchitectureDiagram() {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const isInView = useInView(containerRef, { once: true, margin: "-50px" })
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 })
  const [lines, setLines] = useState<LineData[]>([])
  const [measured, setMeasured] = useState(false)

  const measure = useCallback(() => {
    const c = containerRef.current
    if (!c) return
    const cr = c.getBoundingClientRect()
    setSvgSize({ w: cr.width, h: cr.height })

    const newLines: LineData[] = []
    for (const edge of ARCH_EDGES) {
      const fEl = iconRefs.current[edge.from]
      const tEl = iconRefs.current[edge.to]
      if (!fEl || !tEl) continue
      const fr = fEl.getBoundingClientRect()
      const tr = tEl.getBoundingClientRect()
      newLines.push({
        x1: fr.left + fr.width / 2 - cr.left,
        y1: fr.top + fr.height / 2 - cr.top,
        x2: tr.left + tr.width / 2 - cr.left,
        y2: tr.top + tr.height / 2 - cr.top,
        fc: ARCH_NODES[edge.from].color,
        tc: ARCH_NODES[edge.to].color,
      })
    }
    setLines(newLines)
    setMeasured(true)
  }, [])

  useEffect(() => {
    // measure after first paint so grid has laid out
    const raf = requestAnimationFrame(() => {
      setTimeout(measure, 50)
    })
    window.addEventListener("resize", measure)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", measure) }
  }, [measure])

  const NodeCard = ({ id, delay }: { id: string; delay: number }) => {
    const node = ARCH_NODES[id]
    const Icon = node.icon
    return (
      <motion.div
        className="flex flex-col items-center gap-3 relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay }}
      >
        <div
          ref={(el) => { iconRefs.current[id] = el }}
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg backdrop-blur-md border-2 flex items-center justify-center transition-transform hover:scale-110"
          style={{
            borderColor: `${node.color}50`,
            background: `${node.color}10`,
            boxShadow: `0 0 30px ${node.color}25, inset 0 0 20px ${node.color}08`,
          }}
        >
          <Icon className="w-4 h-4 md:w-5 md:h-5" style={{ color: node.color }} />
        </div>
        <div className="text-center">
          <div className="text-sm md:text-base font-semibold" style={{ color: node.color }}>{node.label}</div>
          <div className="text-xs md:text-sm text-neutral-500 mt-0.5">{node.sub}</div>
        </div>
      </motion.div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full mx-auto">
      {/* SVG connection lines — pixel-perfect from DOM measurement */}
      {measured && svgSize.w > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-0"
          width={svgSize.w}
          height={svgSize.h}
          style={{ overflow: "visible" }}
        >
          <defs>
            {lines.map((l, i) => (
              <linearGradient key={i} id={`dg-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={l.fc} stopOpacity="0.4" />
                <stop offset="100%" stopColor={l.tc} stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>
          {lines.map((l, i) => (
            <g key={i}>
              <motion.line
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={`url(#dg-${i})`}
                strokeWidth="1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.12 }}
              />
              {/* Traveling particle */}
              <circle r="3" fill={l.fc} opacity="0.8" filter="url(#glow)">
                <animateMotion
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                  path={`M${l.x1},${l.y1} L${l.x2},${l.y2}`}
                />
              </circle>
              <circle r="1.5" fill="white" opacity="0.9">
                <animateMotion
                  dur={`${3 + i * 0.5}s`}
                  repeatCount="indefinite"
                  path={`M${l.x1},${l.y1} L${l.x2},${l.y2}`}
                />
              </circle>
            </g>
          ))}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      )}

      {/* 3-row grid */}
      <div className="grid grid-cols-3 gap-y-20 md:gap-y-32 gap-x-8 md:gap-x-16 place-items-center py-4 md:py-8">
        {/* Row 1: Frontend centered */}
        <div />
        <NodeCard id="frontend" delay={0} />
        <div />

        {/* Row 2: Helius — Program — Pinata */}
        <NodeCard id="helius" delay={0.1} />
        <NodeCard id="program" delay={0.15} />
        <NodeCard id="pinata" delay={0.2} />

        {/* Row 3: Receiver centered */}
        <div />
        <NodeCard id="receiver" delay={0.25} />
        <div />
      </div>
    </div>
  )
}

// ============================================
// SECTION 2: Escrow Flow — Live Walkthrough
// ============================================

const ESCROW_STEPS: { status: EscrowStatus; label: string; color: string; terminal: string[] }[] = [
  {
    status: "Open",
    label: "Escrow Created",
    color: "#3b82f6",
    terminal: [
      "$ trustify create-escrow --amount 2.5 --to 7xKp...",
      "Deriving PDA from seeds [escrow, sender, id]...",
      "✓ Escrow PDA: 4nFv...8kLm",
      "✓ 2.5 SOL transferred to vault",
      "Status: Open",
    ],
  },
  {
    status: "InProgress",
    label: "Work Accepted",
    color: "#f97316",
    terminal: [
      "$ trustify accept-escrow --escrow 4nFv...8kLm",
      "Verifying receiver signature...",
      "✓ Receiver joined: 7xKp...3mDq",
      "✓ Escrow status → InProgress",
      "Funds remain locked in PDA vault",
    ],
  },
  {
    status: "Submitted",
    label: "Work Submitted",
    color: "#a855f7",
    terminal: [
      "$ trustify submit-work --escrow 4nFv...8kLm",
      "Uploading metadata to Pinata IPFS...",
      "✓ CID: bafybeig5...xkq4e",
      "✓ On-chain ref: ipfs://bafybeig5...xkq4e",
      "Status: Submitted — awaiting sender approval",
    ],
  },
  {
    status: "Completed",
    label: "Funds Released",
    color: "#22c55e",
    terminal: [
      "$ trustify release-funds --escrow 4nFv...8kLm",
      "Validating sender authority...",
      "✓ Transferring 2.5 SOL → 7xKp...3mDq",
      "✓ PDA vault closed",
      "✓ Escrow complete. Tx: 5Ym8...fK2p",
    ],
  },
]

function EscrowWalkthrough() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeStep, setActiveStep] = useState(0)
  const [autoplaying, setAutoplaying] = useState(true)
  const [terminalLines, setTerminalLines] = useState<string[]>([])

  useEffect(() => {
    if (!isInView) return
    if (!autoplaying) return
    const interval = setInterval(() => {
      setActiveStep((p) => (p + 1) % ESCROW_STEPS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [autoplaying, isInView])

  useEffect(() => {
    setTerminalLines([])
    const step = ESCROW_STEPS[activeStep]
    const timers: ReturnType<typeof setTimeout>[] = []
    step.terminal.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setTerminalLines((prev) => [...prev, line])
        }, i * 400)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [activeStep])

  const handleStepClick = (i: number) => {
    setAutoplaying(false)
    setActiveStep(i)
  }

  return (
    <div ref={ref} className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
      {/* Left: Flow + Steps */}
      <div>
        <div className="mb-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
          <EscrowFlow
            status={ESCROW_STEPS[activeStep].status}
            amount={2.5}
            clientAddress="8Bx4...9fKp"
            freelancerAddress="7xKp...3mDq"
          />
        </div>

        {/* Step cards */}
        <div className="relative space-y-3">
          {/* Progress connector */}
          <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-white/5" />
          <motion.div
            className="absolute left-[17px] top-3 w-0.5 bg-gradient-to-b from-blue-500 to-green-500"
            animate={{ height: `${(activeStep / (ESCROW_STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />

          {ESCROW_STEPS.map((step, i) => (
            <button
              key={step.status}
              onClick={() => handleStepClick(i)}
              className={`relative w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all ${
                i === activeStep
                  ? "bg-white/5 border border-white/10"
                  : "hover:bg-white/[0.02]"
              }`}
            >
              <div
                className={`relative z-10 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${
                  i <= activeStep ? "border-current" : "border-white/20"
                }`}
                style={{ color: i <= activeStep ? step.color : undefined }}
              >
                {i < activeStep && (
                  <div className="w-2 h-2 rounded-full" style={{ background: step.color }} />
                )}
                {i === activeStep && (
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: step.color }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: i === activeStep ? step.color : "#a1a1aa" }}>
                  {step.label}
                </div>
                <div className="text-xs text-neutral-500">{step.status}</div>
              </div>
            </button>
          ))}
        </div>

        {autoplaying ? (
          <p className="mt-4 text-xs text-neutral-500 text-center">Auto-playing — click a step to pause</p>
        ) : (
          <button
            onClick={() => setAutoplaying(true)}
            className="mt-4 flex items-center gap-1.5 mx-auto text-xs text-neutral-500 hover:text-white transition-colors"
          >
            <Play className="w-3 h-3" /> Resume auto-play
          </button>
        )}
      </div>

      {/* Right: Terminal */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0c0e] overflow-hidden sticky top-20 sm:top-24">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
          <span className="text-xs text-neutral-500 ml-2">on-chain activity</span>
        </div>
        <div className="p-5 font-mono text-sm min-h-[200px] sm:min-h-[260px] space-y-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {terminalLines.map((line, i) => (
                <motion.div
                  key={`${activeStep}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={
                    line.startsWith("$")
                      ? "text-white"
                      : line.startsWith("✓")
                      ? "text-green-400"
                      : "text-neutral-500"
                  }
                >
                  {line}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          <span className="inline-block w-2 h-4 bg-white/70 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// ============================================
// SECTION 3: Why Helius — RPC Visualization
// ============================================

function RPCVisualization() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div ref={ref} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Left: Explanation */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm text-orange-400 mb-6">
          <Zap className="w-3.5 h-3.5" />
          Powered by Helius
        </div>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          Enterprise-grade RPC,{" "}
          <span className="text-orange-400">zero cost</span>
        </h3>
        <p className="text-neutral-400 leading-relaxed mb-8">
          Public RPCs rate-limit aggressively and drop requests under load. Trustify uses Helius — dedicated Solana infrastructure with priority routing, WebSocket support, and 50,000 free requests per day.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: "50K", unit: "req/day", label: "Free tier" },
            { value: "<100", unit: "ms", label: "Latency" },
            { value: "99.9", unit: "%", label: "Uptime" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="text-xl md:text-2xl font-bold text-orange-400">
                {stat.value}
                <span className="text-sm font-normal text-orange-400/60 ml-0.5">{stat.unit}</span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Lane animation */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-2xl border border-white/10 bg-[#0c0c0e] p-4 sm:p-6 space-y-6"
      >
        {/* Public RPC lane */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-500 font-medium">Public RPC</span>
            <span className="text-[10px] text-red-400/60 font-mono">429 Too Many Requests</span>
          </div>
          <div className="relative h-8 rounded-full bg-white/5 overflow-hidden">
            {/* Slow dots with failures */}
            {isInView &&
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`pub-${i}`}
                  className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                    i === 2 || i === 4 ? "bg-red-500" : "bg-neutral-500"
                  }`}
                  initial={{ left: "-5%" }}
                  animate={{ left: i === 2 || i === 4 ? `${30 + i * 10}%` : "105%" }}
                  transition={{
                    duration: i === 2 || i === 4 ? 2 : 4,
                    delay: i * 0.7,
                    repeat: Infinity,
                    repeatDelay: i === 2 || i === 4 ? 3 : 1,
                    ease: "linear",
                  }}
                />
              ))}
            {/* Queue indicator */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Helius RPC lane */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-orange-400 font-medium">Helius RPC</span>
            <span className="text-[10px] text-green-400/60 font-mono">200 OK — 48ms</span>
          </div>
          <div className="relative h-8 rounded-full bg-orange-500/5 border border-orange-500/10 overflow-hidden">
            {isInView &&
              Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`hel-${i}`}
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-green-400"
                  style={{ boxShadow: "0 0 6px #22c55e60" }}
                  initial={{ left: "-5%" }}
                  animate={{ left: "105%" }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.4,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                    ease: "linear",
                  }}
                />
              ))}
          </div>
        </div>

        {/* Comparison bar */}
        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-red-400/60">~2000ms</div>
            <div className="text-[10px] text-neutral-500">Avg. public latency</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-400">~48ms</div>
            <div className="text-[10px] text-neutral-500">Helius latency</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// SECTION 4: Why Pinata — On-chain vs Off-chain
// ============================================

const METADATA_JSON = [
  `{`,
  `  "title": "Landing Page Redesign",`,
  `  "description": "Complete redesign of the marketing site",`,
  `  "deliverables": [`,
  `    { "name": "figma-designs.fig", "size": "4.2 MB" },`,
  `    { "name": "assets.zip", "size": "12.8 MB" },`,
  `    { "name": "style-guide.pdf", "size": "1.1 MB" }`,
  `  ],`,
  `  "milestones": ["wireframes", "mockups", "final"],`,
  `  "deadline": "2026-03-15T00:00:00Z"`,
  `}`,
]

function PinataVisualization() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (!isInView) return
    setVisibleLines(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    METADATA_JSON.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleLines(i + 1), 600 + i * 200)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [isInView])

  return (
    <div ref={ref}>
      {/* On-chain → Off-chain visual */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">
        {/* On-chain box */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex-1 p-6 rounded-2xl lg:rounded-r-none border border-purple-500/20 bg-purple-500/5"
        >
          <div className="text-xs text-purple-400 font-medium mb-3 flex items-center gap-2">
            <Database className="w-3.5 h-3.5" />
            Stored on-chain (59 bytes)
          </div>
          <div className="font-mono text-sm text-purple-300 bg-black/30 rounded-lg p-4 break-all">
            ipfs://bafybeig5rfhz...xkq4e
          </div>
          <div className="mt-4 text-xs text-neutral-500">
            Only a tiny CID reference lives in the Solana account data. Costs &lt; 0.001 SOL rent.
          </div>
        </motion.div>

        {/* Arrow */}
        <div className="flex items-center justify-center lg:w-16 py-2 lg:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1 text-neutral-500"
          >
            <span className="hidden lg:block text-[10px] whitespace-nowrap -rotate-0">resolves to</span>
            <ArrowRight className="w-5 h-5 hidden lg:block" />
            <ArrowRight className="w-5 h-5 lg:hidden rotate-90" />
          </motion.div>
        </div>

        {/* Off-chain box */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-[2] rounded-2xl lg:rounded-l-none border border-white/10 bg-[#0c0c0e] overflow-hidden overflow-x-auto"
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
              <div className="w-3 h-3 rounded-full bg-white/10" />
            </div>
            <span className="text-xs text-neutral-500 ml-2">metadata.json — via Pinata IPFS</span>
          </div>
          <div className="p-5 font-mono text-sm">
            {METADATA_JSON.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-neutral-400"
              >
                <span className="text-neutral-600 select-none mr-3">{String(i + 1).padStart(2, " ")}</span>
                {line}
              </motion.div>
            ))}
            {visibleLines < METADATA_JSON.length && (
              <span className="inline-block w-2 h-4 bg-pink-400/70 animate-pulse ml-6" />
            )}
          </div>
        </motion.div>
      </div>

      {/* File cards */}
      <div className="grid sm:grid-cols-3 gap-2 sm:gap-4 mt-8">
        {[
          { name: "figma-designs.fig", size: "4.2 MB", icon: FileCode },
          { name: "assets.zip", size: "12.8 MB", icon: Package },
          { name: "style-guide.pdf", size: "1.1 MB", icon: FileCode },
        ].map((file, i) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.5 + i * 0.15 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <file.icon className="w-4 h-4 text-pink-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{file.name}</div>
              <div className="text-xs text-neutral-500">{file.size}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Key insight */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 2 }}
        className="mt-10 text-center"
      >
        <span className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-sm">
          <span className="text-purple-400 font-mono font-bold">200 bytes on-chain</span>
          <ArrowRight className="w-4 h-4 text-neutral-500" />
          <span className="text-pink-400 font-mono font-bold">unlimited rich data off-chain</span>
        </span>
      </motion.div>
    </div>
  )
}

// ============================================
// SECTION 5: SDK Integration — Code Preview
// ============================================

function SDKPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [codeCopied, setCodeCopied] = useState(false)
  const [npmCopied, setNpmCopied] = useState(false)

  const codeString = `import { TrustifyButton } from "@trustify/sdk"

export default function Checkout() {
  return (
    <TrustifyButton
      amount={1.5}
      receiver="7xKp...3mDq"
      description="Premium headphones"
      onSuccess={(sig) => {
        console.log("Paid!", sig)
      }}
    />
  )
}`

  const handleCodeCopy = () => {
    navigator.clipboard.writeText(codeString)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const handleNpmCopy = () => {
    navigator.clipboard.writeText("npm install @trustify/sdk")
    setNpmCopied(true)
    setTimeout(() => setNpmCopied(false), 2000)
  }

  const codeLines = [
    { parts: [{ text: "import", color: "#a855f7" }, { text: " { ", color: "#e5e5e5" }, { text: "TrustifyButton", color: "#3b82f6" }, { text: " } ", color: "#e5e5e5" }, { text: "from", color: "#a855f7" }, { text: ' "@trustify/sdk"', color: "#22c55e" }] },
    { parts: [] },
    { parts: [{ text: "export", color: "#a855f7" }, { text: " ", color: "#e5e5e5" }, { text: "default", color: "#a855f7" }, { text: " ", color: "#e5e5e5" }, { text: "function", color: "#a855f7" }, { text: " Checkout() {", color: "#e5e5e5" }] },
    { parts: [{ text: "  ", color: "#e5e5e5" }, { text: "return", color: "#a855f7" }, { text: " (", color: "#e5e5e5" }] },
    { parts: [{ text: "    <", color: "#e5e5e5" }, { text: "TrustifyButton", color: "#3b82f6" }] },
    { parts: [{ text: "      ", color: "#e5e5e5" }, { text: "amount", color: "#f97316" }, { text: "={", color: "#e5e5e5" }, { text: "1.5", color: "#f97316" }, { text: "}", color: "#e5e5e5" }] },
    { parts: [{ text: "      ", color: "#e5e5e5" }, { text: "receiver", color: "#f97316" }, { text: "=", color: "#e5e5e5" }, { text: '"7xKp...3mDq"', color: "#22c55e" }] },
    { parts: [{ text: "      ", color: "#e5e5e5" }, { text: "description", color: "#f97316" }, { text: "=", color: "#e5e5e5" }, { text: '"Premium headphones"', color: "#22c55e" }] },
    { parts: [{ text: "      ", color: "#e5e5e5" }, { text: "onSuccess", color: "#f97316" }, { text: "={(sig) => {", color: "#e5e5e5" }] },
    { parts: [{ text: "        console.", color: "#e5e5e5" }, { text: "log", color: "#3b82f6" }, { text: "(", color: "#e5e5e5" }, { text: '"Paid!"', color: "#22c55e" }, { text: ", sig)", color: "#e5e5e5" }] },
    { parts: [{ text: "      }}", color: "#e5e5e5" }] },
    { parts: [{ text: "    />", color: "#e5e5e5" }] },
    { parts: [{ text: "  )", color: "#e5e5e5" }] },
    { parts: [{ text: "}", color: "#e5e5e5" }] },
  ]

  const features = [
    { icon: Terminal, title: "One command install", desc: "Single npm package with zero peer dependencies. Works with any React framework.", color: "#22c55e", borderColor: "border-l-green-500" },
    { icon: Code2, title: "Drop-in component", desc: "One <TrustifyButton /> handles wallet connection, escrow creation, and payment — all in a single component.", color: "#3b82f6", borderColor: "border-l-blue-500" },
    { icon: Layers, title: "Full escrow lifecycle", desc: "Create, fund, track, approve, and release — every state managed on-chain with real-time updates.", color: "#a855f7", borderColor: "border-l-purple-500" },
  ]

  return (
    <div ref={ref} className="grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-12 items-start">
      {/* Left: Info + npm + features */}
      <div>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-sm text-green-400 mb-8"
        >
          <Package className="w-3.5 h-3.5" />
          Developer SDK
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.05 }}
          className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
        >
          Integrate in{" "}
          <span className="text-green-400">minutes</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-neutral-400 leading-relaxed mb-8"
        >
          One React component. Full escrow lifecycle. No backend needed.
        </motion.p>

        {/* npm install command */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <button
            onClick={handleNpmCopy}
            className="group flex items-center gap-3 w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#0c0c0e] border border-white/10 hover:border-green-500/30 transition-all"
          >
            <span className="text-green-400 font-mono text-sm">$</span>
            <span className="font-mono text-sm text-neutral-300">npm install @trustify/sdk</span>
            <span className="ml-auto sm:ml-4 text-neutral-500 group-hover:text-green-400 transition-colors">
              {npmCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </span>
          </button>
        </motion.div>

        {/* Feature cards — stacked with colored left border */}
        <div className="space-y-4">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.1 }}
              className={`flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5 border-l-2 ${feat.borderColor} hover:bg-white/[0.04] transition-colors`}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${feat.color}15` }}
              >
                <feat.icon className="w-5 h-5" style={{ color: feat.color }} />
              </div>
              <div>
                <div className="text-base font-semibold mb-1">{feat.title}</div>
                <div className="text-sm text-neutral-500 leading-relaxed">{feat.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right: Code window — sticky */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-[#0c0c0e] overflow-hidden md:sticky md:top-24"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <span className="text-xs text-neutral-500 ml-2">checkout.tsx</span>
          </div>
          <button
            onClick={handleCodeCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-xs text-neutral-400"
          >
            {codeCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {codeCopied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="p-5 font-mono text-sm leading-6 overflow-x-auto">
          {codeLines.map((line, i) => (
            <div key={i} className="flex">
              <span className="text-neutral-600 select-none w-6 sm:w-8 text-right mr-4 flex-shrink-0 text-xs sm:text-sm">
                {i + 1}
              </span>
              <span>
                {line.parts.map((part, j) => (
                  <span key={j} style={{ color: part.color, whiteSpace: "pre" }}>
                    {part.text}
                  </span>
                ))}
                {line.parts.length === 0 && "\u00A0"}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// SECTION WRAPPER — Scroll reveal
// ============================================

function Section({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode
  id?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`relative z-10 px-4 sm:px-6 py-24 md:py-32 ${className}`}
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </motion.section>
  )
}

// ============================================
// PAGE
// ============================================

export default function ArchitecturePage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-neutral-900/30 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#09090b]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-0.5"><Image src="/logo.png" alt="Trustify" width={36} height={36} className="w-full h-full object-contain rounded-lg" /></div>
              <span className="font-bold text-xl tracking-tight">Trustify</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {[
                { label: "Home", href: "/" },
                { label: "Demo", href: "/demo" },
                { label: "How it Works", href: "/how-it-works" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-2 text-base text-neutral-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-base text-neutral-400 hover:text-white"
                onClick={() => router.push("/demo")}
              >
                Demo
              </Button>
              <Button
                className="bg-white text-black hover:bg-neutral-200 font-medium text-base h-11 px-6"
                onClick={() => router.push("/dashboard")}
              >
                Launch App
                <ArrowRight className="w-4 h-4 ml-1.5" />
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

        {isMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#09090b]">
            <div className="px-6 py-4 space-y-4">
              <Link href="/" className="block text-neutral-400">Home</Link>
              <Link href="/demo" className="block text-neutral-400">Demo</Link>
              <Link href="/how-it-works" className="block text-neutral-400">How it Works</Link>
              <div className="pt-4 border-t border-white/5 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => router.push("/demo")}>Demo</Button>
                <Button className="w-full bg-white text-black" onClick={() => router.push("/dashboard")}>Launch App</Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===== SECTION 1: Hero + Architecture Map ===== */}
      <section className="relative z-10 pt-32 md:pt-40 pb-20 md:pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20 md:mb-24"
          >
            <h1
              className={`${spaceGrotesk.className} font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent`}
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", WebkitBackgroundClip: "text", lineHeight: 1.05, letterSpacing: "-0.04em" }}
            >
              Under the Hood
            </h1>
            <p className="text-neutral-400 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)" }}>
              Every component, every connection, one interactive map
            </p>
          </motion.div>

          {/* Diagram card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 md:p-16 max-w-5xl mx-auto">
            <ArchitectureDiagram />
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: Escrow Flow ===== */}
      <Section>
        <div className="max-w-2xl mb-14 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Escrow Lifecycle
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed">
            Watch funds move through the smart contract in real-time. Every state transition is an on-chain transaction.
          </p>
        </div>
        <EscrowWalkthrough />
      </Section>

      {/* ===== SECTION 3: Why Helius ===== */}
      <Section className="bg-gradient-to-b from-transparent via-orange-500/[0.02] to-transparent">
        <div className="max-w-2xl mb-14 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Why Helius RPC
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed">
            The difference between a sluggish app and a blazing-fast one is the RPC layer.
          </p>
        </div>
        <RPCVisualization />
      </Section>

      {/* ===== SECTION 4: Why Pinata ===== */}
      <Section className="bg-gradient-to-b from-transparent via-pink-500/[0.02] to-transparent">
        <div className="max-w-2xl mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-sm text-pink-400 mb-6">
            <Cloud className="w-3.5 h-3.5" />
            Powered by Pinata
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            On-chain reference,{" "}
            <span className="text-pink-400">off-chain richness</span>
          </h2>
          <p className="text-lg md:text-xl text-neutral-400 leading-relaxed">
            Solana accounts are expensive. We store a tiny IPFS CID on-chain and all rich metadata — files, descriptions, milestones — on Pinata IPFS.
          </p>
        </div>
        <PinataVisualization />
      </Section>

      {/* ===== SECTION 5: SDK ===== */}
      <Section className="bg-gradient-to-b from-transparent via-green-500/[0.02] to-transparent">
        <SDKPreview />
      </Section>

      {/* ===== SECTION 6: CTA ===== */}
      <Section>
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-12 md:p-20 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-purple-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Ready to build with Trustify?
            </h2>
            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed mb-10">
              Explore the full escrow flow on Solana Devnet. Zero risk, zero cost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 h-12 px-8 font-medium"
                onClick={() => router.push("/dashboard")}
              >
                Start Building
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                onClick={() => router.push("/demo")}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative z-10 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto py-16 md:py-20">
          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-0.5"><Image src="/logo.png" alt="Trustify" width={36} height={36} className="w-full h-full object-contain rounded-lg" /></div>
                <span className="font-bold text-xl tracking-tight">Trustify</span>
              </Link>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                Decentralized payment escrow middleware built on Solana. Secure any transaction with smart contracts.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h4>
              <div className="flex flex-col gap-3">
                <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">Home</Link>
                <Link href="/demo" className="text-sm text-neutral-400 hover:text-white transition-colors">Demo</Link>
                <Link href="/how-it-works" className="text-sm text-neutral-400 hover:text-white transition-colors">How it Works</Link>
                <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Network</h4>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-sm text-neutral-300">Solana Devnet</span>
              </div>
              <p className="text-sm text-neutral-500">All transactions run on devnet. Zero risk, zero cost.</p>
            </div>
          </div>

          {/* Divider + bottom row */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-neutral-600">&copy; {new Date().getFullYear()} Trustify. All rights reserved.</p>
            <p className="text-xs text-neutral-600">Built on Solana</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
