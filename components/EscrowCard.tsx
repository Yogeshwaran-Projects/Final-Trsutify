"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/StatusBadge"
import { SolAmount } from "@/components/SolAmount"
import {
  type EscrowAccount,
  lamportsToSol,
  getEscrowTitle,
  getEscrowDescription,
  acceptEscrow,
  submitWork,
  releaseFunds,
  cancelEscrow,
  raiseDispute,
} from "@/lib/solana"
import { getFileUrl } from "@/lib/ipfs"
import {
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  User,
  ArrowUpRight,
} from "lucide-react"

interface EscrowCardProps {
  escrow: EscrowAccount
  onAction?: () => void
}

export function EscrowCard({ escrow, onAction }: EscrowCardProps) {
  const wallet = useWallet()
  const [loading, setLoading] = useState("")
  const [error, setError] = useState("")

  const sol = lamportsToSol(escrow.amount)
  const title = getEscrowTitle(escrow)
  const desc = getEscrowDescription(escrow)
  const files = escrow.metadata?.files ?? []
  const isClient = wallet.publicKey?.toBase58() === escrow.client.toBase58()
  const isFreelancer =
    wallet.publicKey?.toBase58() === escrow.freelancer.toBase58()
  const zeroKey = new Uint8Array(32).every((b) => b === 0)
  const freelancerIsZero = escrow.freelancer.toBuffer().every((b) => b === 0)

  const runAction = async (
    label: string,
    fn: () => Promise<any>
  ) => {
    setLoading(label)
    setError("")
    try {
      await fn()
      onAction?.()
    } catch (err: any) {
      setError(err.message || `${label} failed`)
    } finally {
      setLoading("")
    }
  }

  const truncate = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate">{title}</h3>
          {desc && (
            <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{desc}</p>
          )}
        </div>
        <StatusBadge status={escrow.status} />
      </div>

      {/* Amount */}
      <div className="text-lg">
        <SolAmount sol={sol} />
      </div>

      {/* Addresses */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500">
        <span>
          Sender: <span className="font-mono">{truncate(escrow.client.toBase58())}</span>
          {isClient && <span className="ml-1 text-blue-400">(you)</span>}
        </span>
        {!freelancerIsZero && (
          <span>
            Receiver:{" "}
            <span className="font-mono">{truncate(escrow.freelancer.toBase58())}</span>
            {isFreelancer && <span className="ml-1 text-green-400">(you)</span>}
          </span>
        )}
      </div>

      {/* Files */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <a
              key={f.cid}
              href={getFileUrl(f.cid)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 text-xs text-neutral-300 hover:bg-neutral-700 transition-colors"
            >
              <FileText className="w-3 h-3" />
              {f.name}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        {/* Open escrow: freelancer can accept */}
        {escrow.status === "Open" && !isClient && (
          <Button
            size="sm"
            onClick={() =>
              runAction("Accept", () =>
                acceptEscrow(wallet, escrow.publicKey.toBase58())
              )
            }
            disabled={!!loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading === "Accept" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <User className="w-4 h-4 mr-1" />
            )}
            Accept
          </Button>
        )}

        {/* Open escrow: client can cancel */}
        {escrow.status === "Open" && isClient && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              runAction("Cancel", () =>
                cancelEscrow(wallet, escrow.publicKey.toBase58())
              )
            }
            disabled={!!loading}
            className="border-red-800 text-red-400 hover:bg-red-900/30"
          >
            {loading === "Cancel" && (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            )}
            Cancel
          </Button>
        )}

        {/* InProgress: freelancer can submit work */}
        {escrow.status === "InProgress" && isFreelancer && (
          <Button
            size="sm"
            onClick={() =>
              runAction("Submit", () =>
                submitWork(wallet, escrow.publicKey.toBase58())
              )
            }
            disabled={!!loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading === "Submit" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <ArrowUpRight className="w-4 h-4 mr-1" />
            )}
            Submit Work
          </Button>
        )}

        {/* Submitted: client can release funds */}
        {escrow.status === "Submitted" && isClient && (
          <Button
            size="sm"
            onClick={() =>
              runAction("Release", () =>
                releaseFunds(
                  wallet,
                  escrow.publicKey.toBase58(),
                  escrow.freelancer.toBase58()
                )
              )
            }
            disabled={!!loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading === "Release" && (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            )}
            Release Funds
          </Button>
        )}

        {/* InProgress/Submitted: either party can dispute */}
        {(escrow.status === "InProgress" || escrow.status === "Submitted") &&
          (isClient || isFreelancer) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                runAction("Dispute", () =>
                  raiseDispute(wallet, escrow.publicKey.toBase58())
                )
              }
              disabled={!!loading}
              className="border-orange-800 text-orange-400 hover:bg-orange-900/30"
            >
              {loading === "Dispute" && (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              )}
              Dispute
            </Button>
          )}
      </div>
    </div>
  )
}
