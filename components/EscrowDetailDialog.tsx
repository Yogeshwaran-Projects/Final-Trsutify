"use client"

import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/StatusBadge"
import { SolAmount } from "@/components/SolAmount"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  type EscrowAccount,
  lamportsToSol,
  getEscrowTitle,
  getEscrowDescription,
  getAddressExplorerUrl,
} from "@/lib/solana"
import { getFileUrl } from "@/lib/ipfs"
import {
  Clock,
  Hash,
  ExternalLink,
  FileText,
  Shield,
  Loader2,
  User,
  CheckSquare,
} from "lucide-react"

interface EscrowDetailDialogProps {
  escrow: EscrowAccount | null
  onClose: () => void
  onAccept: () => void
  accepting: boolean
}

function DeadlineCountdown({ deadline }: { deadline: string }) {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs border border-red-500/30">
        <Clock className="w-3 h-3" />
        Overdue by {Math.abs(diffDays)}d
      </span>
    )
  }
  if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">
        <Clock className="w-3 h-3" />
        {diffDays === 0 ? "Due today" : `${diffDays}d left`}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-700/50 text-neutral-300 text-xs border border-neutral-600">
      <Clock className="w-3 h-3" />
      {diffDays}d left
    </span>
  )
}

export function EscrowDetailDialog({
  escrow,
  onClose,
  onAccept,
  accepting,
}: EscrowDetailDialogProps) {
  if (!escrow) return null

  const sol = lamportsToSol(escrow.amount)
  const title = getEscrowTitle(escrow)
  const desc = getEscrowDescription(escrow)
  const metadata = escrow.metadata
  const deadline = metadata?.deadline
  const techstack = metadata?.techstack ?? []
  const requirements = metadata?.requirements ?? []
  const files = metadata?.files ?? []
  const wlCount = metadata?.whitelist?.length ?? 0
  const blCount = metadata?.blocklist?.length ?? 0

  const truncate = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`

  return (
    <Dialog open={!!escrow} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-white">{title}</DialogTitle>
            <StatusBadge status={escrow.status} />
          </div>
          <DialogDescription className="sr-only">
            Escrow details for {title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Amount — prominent centered box */}
          <div className="flex justify-center">
            <div className="rounded-xl border border-neutral-700 bg-neutral-800/60 px-8 py-4 text-center">
              <p className="text-xs text-neutral-500 mb-1">Amount</p>
              <div className="text-2xl font-bold">
                <SolAmount sol={sol} />
              </div>
            </div>
          </div>

          {/* Description */}
          {desc && (
            <div>
              <p className="text-xs text-neutral-500 mb-1">Description</p>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{desc}</p>
            </div>
          )}

          {/* Deadline */}
          {deadline && (
            <div>
              <p className="text-xs text-neutral-500 mb-1">Deadline</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-300">
                  {new Date(deadline).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <DeadlineCountdown deadline={deadline} />
              </div>
            </div>
          )}

          {/* Tech Stack */}
          {techstack.length > 0 && (
            <div>
              <p className="text-xs text-neutral-500 mb-1.5">Tech Stack</p>
              <div className="flex flex-wrap gap-1.5">
                {techstack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-xs border border-blue-500/25"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <div>
              <p className="text-xs text-neutral-500 mb-1.5">Requirements</p>
              <div className="space-y-1.5">
                {requirements.map((req, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-neutral-300">{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Files */}
          {files.length > 0 && (
            <div>
              <p className="text-xs text-neutral-500 mb-1.5">Attached Files</p>
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
            </div>
          )}

          {/* Sender */}
          <div>
            <p className="text-xs text-neutral-500 mb-1">Sender</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-neutral-300">
                {escrow.client.toBase58()}
              </span>
              <a
                href={getAddressExplorerUrl(escrow.client.toBase58())}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Whitelist / Blocklist badges */}
          {(wlCount > 0 || blCount > 0) && (
            <div className="flex flex-wrap gap-2">
              {wlCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 text-green-300 text-xs border border-green-500/25">
                  <Shield className="w-3 h-3" />
                  {wlCount} whitelisted
                </span>
              )}
              {blCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 text-xs border border-red-500/25">
                  <Shield className="w-3 h-3" />
                  {blCount} blocked
                </span>
              )}
            </div>
          )}

          {/* Created + Escrow ID */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-neutral-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Created
              </span>
              <div className="text-neutral-300 mt-0.5">
                {new Date(
                  escrow.createdAt.toNumber() * 1000
                ).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
            <div>
              <span className="text-neutral-500 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Escrow ID
              </span>
              <div className="text-neutral-300 mt-0.5 font-mono">
                {truncate(escrow.publicKey.toBase58())}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            Close
          </Button>
          <Button
            onClick={onAccept}
            disabled={accepting}
            className="bg-green-600 hover:bg-green-700"
          >
            {accepting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <User className="w-4 h-4 mr-1" />
            )}
            Accept Escrow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
