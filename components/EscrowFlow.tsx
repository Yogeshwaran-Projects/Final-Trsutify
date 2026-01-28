"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Shield, User, ArrowRight, Lock, Unlock, CheckCircle } from "lucide-react"
import type { EscrowStatus } from "@/lib/solana"

interface EscrowFlowProps {
  status: EscrowStatus
  amount?: number
  clientAddress?: string
  freelancerAddress?: string
  showLabels?: boolean
  compact?: boolean
}

export function EscrowFlow({
  status,
  amount = 0,
  clientAddress,
  freelancerAddress,
  showLabels = true,
  compact = false,
}: EscrowFlowProps) {
  const [animationStep, setAnimationStep] = useState(0)

  // Determine which elements should be highlighted based on status
  const getFlowState = () => {
    switch (status) {
      case "Open":
        return { client: true, vault: true, freelancer: false, funds: "vault" }
      case "InProgress":
        return { client: true, vault: true, freelancer: true, funds: "vault" }
      case "Submitted":
        return { client: true, vault: true, freelancer: true, funds: "vault" }
      case "Completed":
        return { client: false, vault: false, freelancer: true, funds: "freelancer" }
      case "Cancelled":
        return { client: true, vault: false, freelancer: false, funds: "client" }
      case "Disputed":
        return { client: true, vault: true, freelancer: true, funds: "vault" }
      default:
        return { client: false, vault: false, freelancer: false, funds: "none" }
    }
  }

  const flowState = getFlowState()

  // Animate funds movement
  useEffect(() => {
    if (status === "Completed" || status === "Cancelled") {
      const timer = setTimeout(() => setAnimationStep(1), 500)
      return () => clearTimeout(timer)
    }
    setAnimationStep(0)
  }, [status])

  const truncateAddress = (address?: string) => {
    if (!address) return "..."
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const iconSize = compact ? "w-6 h-6" : "w-8 h-8"
  const boxSize = compact ? "w-16 h-16" : "w-24 h-24"
  const arrowGap = compact ? "w-8" : "w-16"

  return (
    <div className="w-full">
      {/* Main Flow Visualization */}
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {/* Client Wallet */}
        <motion.div
          className={`flex flex-col items-center`}
          animate={{
            opacity: flowState.client ? 1 : 0.4,
            scale: flowState.client ? 1 : 0.95,
          }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`${boxSize} rounded-xl flex items-center justify-center transition-all ${
              flowState.client
                ? "bg-gradient-to-br from-blue-500/30 to-blue-600/30 border-2 border-blue-400/50"
                : "bg-white/5 border border-white/10"
            }`}
          >
            <Wallet className={`${iconSize} ${flowState.client ? "text-blue-400" : "text-white/40"}`} />
          </div>
          {showLabels && (
            <div className="mt-2 text-center">
              <p className={`text-xs font-medium ${flowState.client ? "text-blue-300" : "text-white/40"}`}>
                Client
              </p>
              {clientAddress && (
                <p className="text-[10px] text-white/40 font-mono">
                  {truncateAddress(clientAddress)}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Arrow: Client -> Vault */}
        <div className={`${arrowGap} flex items-center justify-center relative`}>
          <motion.div
            className="absolute h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{
              width: status === "Open" || status === "InProgress" || status === "Submitted" || status === "Disputed"
                ? "100%"
                : status === "Cancelled" && animationStep === 1
                ? "100%"
                : "0%",
            }}
            transition={{ duration: 0.5 }}
          />
          {/* Animated coin for funds movement */}
          <AnimatePresence>
            {(status === "Open" || (status === "Cancelled" && animationStep === 1)) && (
              <motion.div
                className="absolute"
                initial={{ x: status === "Cancelled" ? 20 : -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: status === "Cancelled" ? -20 : 20, opacity: 0 }}
                transition={{ duration: 0.5, repeat: status === "Open" ? Infinity : 0, repeatDelay: 1 }}
              >
                <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[8px] font-bold text-yellow-900">
                  $
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PDA Vault */}
        <motion.div
          className="flex flex-col items-center"
          animate={{
            opacity: flowState.vault ? 1 : 0.4,
            scale: flowState.vault ? 1 : 0.95,
          }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`${boxSize} rounded-xl flex flex-col items-center justify-center transition-all ${
              flowState.vault
                ? "bg-gradient-to-br from-purple-500/30 to-purple-600/30 border-2 border-purple-400/50"
                : "bg-white/5 border border-white/10"
            }`}
          >
            <Shield className={`${iconSize} ${flowState.vault ? "text-purple-400" : "text-white/40"}`} />
            {flowState.funds === "vault" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-1"
              >
                <Lock className="w-3 h-3 text-purple-300" />
              </motion.div>
            )}
          </div>
          {showLabels && (
            <div className="mt-2 text-center">
              <p className={`text-xs font-medium ${flowState.vault ? "text-purple-300" : "text-white/40"}`}>
                PDA Vault
              </p>
              {amount > 0 && flowState.funds === "vault" && (
                <p className="text-[10px] text-yellow-400 font-mono">
                  {amount} SOL
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Arrow: Vault -> Freelancer */}
        <div className={`${arrowGap} flex items-center justify-center relative`}>
          <motion.div
            className="absolute h-0.5 bg-gradient-to-r from-purple-500 to-green-500"
            initial={{ width: 0 }}
            animate={{
              width: status === "Completed" || status === "InProgress" || status === "Submitted" || status === "Disputed"
                ? "100%"
                : "0%",
            }}
            transition={{ duration: 0.5 }}
          />
          {/* Animated coin for funds release */}
          <AnimatePresence>
            {status === "Completed" && animationStep === 1 && (
              <motion.div
                className="absolute"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 20, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[8px] font-bold text-yellow-900">
                  $
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Freelancer Wallet */}
        <motion.div
          className="flex flex-col items-center"
          animate={{
            opacity: flowState.freelancer ? 1 : 0.4,
            scale: flowState.freelancer ? 1 : 0.95,
          }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`${boxSize} rounded-xl flex items-center justify-center transition-all ${
              flowState.freelancer
                ? "bg-gradient-to-br from-green-500/30 to-green-600/30 border-2 border-green-400/50"
                : "bg-white/5 border border-white/10"
            }`}
          >
            <User className={`${iconSize} ${flowState.freelancer ? "text-green-400" : "text-white/40"}`} />
            {status === "Completed" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-1 -right-1"
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
              </motion.div>
            )}
          </div>
          {showLabels && (
            <div className="mt-2 text-center">
              <p className={`text-xs font-medium ${flowState.freelancer ? "text-green-300" : "text-white/40"}`}>
                Freelancer
              </p>
              {freelancerAddress && (
                <p className="text-[10px] text-white/40 font-mono">
                  {truncateAddress(freelancerAddress)}
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Badge */}
      {showLabels && (
        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              status === "Open"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : status === "InProgress"
                ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                : status === "Submitted"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : status === "Completed"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : status === "Cancelled"
                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
            }`}
          >
            {status === "Open" && "Funds Locked in Vault"}
            {status === "InProgress" && "Work In Progress"}
            {status === "Submitted" && "Awaiting Approval"}
            {status === "Completed" && "Funds Released"}
            {status === "Cancelled" && "Funds Refunded"}
            {status === "Disputed" && "Dispute Raised"}
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Simple static version for landing page
export function EscrowFlowStatic() {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-center gap-4 md:gap-8">
        {/* Client */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 border-2 border-blue-400/50 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-blue-400" />
          </div>
          <p className="mt-2 text-sm text-blue-300 font-medium">Client</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <div className="w-8 md:w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500" />
          <ArrowRight className="w-5 h-5 text-purple-400 -ml-1" />
        </div>

        {/* Vault */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-600/30 border-2 border-purple-400/50 flex flex-col items-center justify-center">
            <Shield className="w-8 h-8 text-purple-400" />
            <Lock className="w-4 h-4 text-purple-300 mt-1" />
          </div>
          <p className="mt-2 text-sm text-purple-300 font-medium">Smart Contract</p>
          <p className="text-xs text-yellow-400">Funds Secured</p>
        </div>

        {/* Arrow */}
        <div className="flex items-center">
          <div className="w-8 md:w-16 h-0.5 bg-gradient-to-r from-purple-500 to-green-500" />
          <ArrowRight className="w-5 h-5 text-green-400 -ml-1" />
        </div>

        {/* Freelancer */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/30 border-2 border-green-400/50 flex items-center justify-center">
            <User className="w-8 h-8 text-green-400" />
          </div>
          <p className="mt-2 text-sm text-green-300 font-medium">Freelancer</p>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 text-center max-w-xl mx-auto">
        <p className="text-white/70 text-sm">
          Client deposits funds into a smart contract vault. When work is approved,
          funds are automatically released to the freelancer. No middleman, no fees.
        </p>
      </div>
    </div>
  )
}
