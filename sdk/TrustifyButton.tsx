"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Shield, Loader2, CheckCircle, AlertCircle, ExternalLink, RotateCcw } from "lucide-react"
import { createEscrow, getExplorerUrl } from "@/lib/solana"

interface TrustifyButtonProps {
  amount: number
  description: string
  receiver?: string
  onSuccess?: (signature: string) => void
  onError?: (error: Error) => void
  className?: string
  label?: string
}

type ButtonState = "idle" | "processing" | "success" | "error"

export function TrustifyButton({
  amount,
  description,
  receiver,
  onSuccess,
  onError,
  className = "",
  label = "Pay with Trustify",
}: TrustifyButtonProps) {
  const wallet = useWallet()
  const [state, setState] = useState<ButtonState>("idle")
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleClick = async () => {
    if (!wallet.connected) return
    setState("processing")
    setErrorMessage(null)
    try {
      const result = await createEscrow(wallet, amount, description, receiver)
      setTxSignature(result.signature)
      setState("success")
      onSuccess?.(result.signature)
    } catch (e: any) {
      const msg = e.message || "Transaction failed"
      setErrorMessage(msg)
      setState("error")
      onError?.(e)
    }
  }

  const handleRetry = () => {
    setState("idle")
    setTxSignature(null)
    setErrorMessage(null)
  }

  if (!wallet.connected) {
    return (
      <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
        <WalletMultiButton className="!bg-neutral-900 !text-white hover:!bg-neutral-800 !rounded-lg !h-10 !text-sm" />
        <p className="text-neutral-500 text-xs">Connect wallet to pay</p>
      </div>
    )
  }

  if (state === "success" && txSignature) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Escrow created!</span>
        </div>
        <a
          href={getExplorerUrl(txSignature)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
        >
          View on Solana Explorer <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  if (state === "error") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-1 text-neutral-400 hover:text-white text-xs transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Try again
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "processing"}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
        transition-all duration-200
        ${state === "processing"
          ? "bg-neutral-800 text-neutral-400 cursor-wait"
          : "bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600"
        }
        ${className}
      `}
    >
      {state === "processing" ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating escrow...
        </>
      ) : (
        <>
          <Shield className="w-4 h-4" />
          {label} — {amount} SOL
        </>
      )}
    </button>
  )
}
