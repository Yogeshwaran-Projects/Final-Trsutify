"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/StatusBadge"
import { SolAmount } from "@/components/SolAmount"
import { FileUpload, type UploadedFile } from "@/components/FileUpload"
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
  getAddressExplorerUrl,
} from "@/lib/solana"
import { getFileUrl } from "@/lib/ipfs"
import {
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  User,
  ArrowUpRight,
  Upload,
  X,
  Eye,
  ChevronDown,
  Clock,
  Hash,
  RefreshCw,
} from "lucide-react"

interface EscrowCardProps {
  escrow: EscrowAccount
  onAction?: () => void
}

export function EscrowCard({ escrow, onAction }: EscrowCardProps) {
  const wallet = useWallet()
  const [loading, setLoading] = useState("")
  const [error, setError] = useState("")
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [expanded, setExpanded] = useState(false)

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
      {/* Header — click to expand details */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white truncate">{title}</h3>
              <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
            </div>
            {desc && (
              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{desc}</p>
            )}
          </div>
          <StatusBadge status={escrow.status} />
        </div>

        {/* Amount */}
        <div className="text-lg mt-3">
          <SolAmount sol={sol} />
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-800/30 p-4 space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-neutral-500 text-xs">Sender</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-neutral-300 text-xs">{escrow.client.toBase58()}</span>
                {isClient && <span className="text-blue-400 text-xs">(you)</span>}
              </div>
            </div>
            {!freelancerIsZero && (
              <div>
                <span className="text-neutral-500 text-xs">Receiver</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-neutral-300 text-xs">{escrow.freelancer.toBase58()}</span>
                  {isFreelancer && <span className="text-green-400 text-xs">(you)</span>}
                </div>
              </div>
            )}
            {freelancerIsZero && (
              <div>
                <span className="text-neutral-500 text-xs">Receiver</span>
                <div className="text-neutral-400 text-xs mt-0.5">Open to anyone</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-neutral-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Created</span>
              <div className="text-neutral-300 text-xs mt-0.5">
                {new Date(escrow.createdAt.toNumber() * 1000).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </div>
            </div>
            <div>
              <span className="text-neutral-500 text-xs flex items-center gap-1"><Hash className="w-3 h-3" /> Escrow ID</span>
              <div className="text-neutral-300 text-xs mt-0.5 font-mono">{truncate(escrow.publicKey.toBase58())}</div>
            </div>
            <div>
              <a
                href={getAddressExplorerUrl(escrow.publicKey.toBase58())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3"
              >
                View on Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {desc && (
            <div>
              <span className="text-neutral-500 text-xs">Full Description</span>
              <p className="text-neutral-300 text-xs mt-0.5 whitespace-pre-wrap">{desc}</p>
            </div>
          )}

          {/* Attached files in expanded view */}
          {files.length > 0 && (
            <div>
              <span className="text-neutral-500 text-xs">Attached Files</span>
              <div className="flex flex-wrap gap-2 mt-1">
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
            </div>
          )}

          {/* Refresh button inside expanded view */}
          <div className="flex items-center gap-2 pt-2 border-t border-neutral-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAction?.()
              }}
              className="text-neutral-400 hover:text-white text-xs gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* Compact addresses (when collapsed) */}
      {!expanded && (
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
      )}

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

      {/* Proof Review: show submission proof when status is submitted and viewer is sender */}
      {escrow.status === "Submitted" && escrow.submissionCid && isClient && (
        <div className="rounded-lg border border-purple-800/50 bg-purple-900/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
            <Eye className="w-4 h-4" />
            Proof of Work Submitted
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono truncate">
              CID: {escrow.submissionCid}
            </span>
            <a
              href={getFileUrl(escrow.submissionCid)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-800/40 text-xs text-purple-200 hover:bg-purple-700/50 transition-colors shrink-0"
            >
              View on IPFS
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
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
            onClick={() => setShowSubmitDialog(true)}
            disabled={!!loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Upload className="w-4 h-4 mr-1" />
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

      {/* Submit Work Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Submit Work with Proof</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-400 hover:text-white"
                onClick={() => {
                  setShowSubmitDialog(false)
                  setUploadedFiles([])
                  setError("")
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-neutral-400">
              Upload your work files to IPFS as proof of completion. The sender will review these before releasing funds.
            </p>

            <FileUpload
              onFilesChange={setUploadedFiles}
              maxFiles={5}
            />

            {uploadedFiles.length > 0 && (
              <div className="text-xs text-neutral-500">
                CID: <span className="font-mono">{uploadedFiles[0].cid}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={uploadedFiles.length === 0 || !!loading}
              onClick={() =>
                runAction("Submit", async () => {
                  await submitWork(
                    wallet,
                    escrow.publicKey.toBase58(),
                    uploadedFiles[0].cid
                  )
                  setShowSubmitDialog(false)
                  setUploadedFiles([])
                })
              }
            >
              {loading === "Submit" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ArrowUpRight className="w-4 h-4 mr-2" />
              )}
              Submit with Proof
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
