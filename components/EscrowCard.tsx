"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { getFileUrl, fetchSubmissionMetadata, type SubmissionMetadata } from "@/lib/ipfs"
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
  CheckCircle,
  AlertTriangle,
  Github,
  Shield,
} from "lucide-react"

interface EscrowCardProps {
  escrow: EscrowAccount
  onAction?: () => void
  onViewDetails?: () => void
}

interface VerificationResult {
  verified: boolean
  hasCode: boolean
  commitCount: number
  languages: Record<string, number>
  techstackMatch: string[]
  repoName: string
  error: string | null
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs border border-red-500/30">
        <Clock className="w-3 h-3" />
        Overdue
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

export function EscrowCard({ escrow, onAction, onViewDetails }: EscrowCardProps) {
  const wallet = useWallet()
  const [loading, setLoading] = useState("")
  const [error, setError] = useState("")
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [expanded, setExpanded] = useState(false)

  // Submit dialog state
  const [githubUrl, setGithubUrl] = useState("")
  const [checklistCompleted, setChecklistCompleted] = useState<boolean[]>([])
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [verifying, setVerifying] = useState(false)

  // Proof review state
  const [submissionMeta, setSubmissionMeta] = useState<SubmissionMetadata | null>(null)
  const [loadingSubmission, setLoadingSubmission] = useState(false)

  const sol = lamportsToSol(escrow.amount)
  const title = getEscrowTitle(escrow)
  const desc = getEscrowDescription(escrow)
  const files = escrow.metadata?.files ?? []
  const isClient = wallet.publicKey?.toBase58() === escrow.client.toBase58()
  const isFreelancer =
    wallet.publicKey?.toBase58() === escrow.freelancer.toBase58()
  const freelancerIsZero = escrow.freelancer.toBuffer().every((b) => b === 0)

  const metadata = escrow.metadata
  const deadline = metadata?.deadline
  const techstack = metadata?.techstack ?? []
  const requirements = metadata?.requirements ?? []
  const wlCount = metadata?.whitelist?.length ?? 0
  const blCount = metadata?.blocklist?.length ?? 0

  // Initialize checklist when opening submit dialog
  useEffect(() => {
    if (showSubmitDialog && requirements.length > 0) {
      setChecklistCompleted(new Array(requirements.length).fill(false))
    }
  }, [showSubmitDialog, requirements.length])

  // Fetch submission metadata for proof review
  useEffect(() => {
    if (escrow.status === "Submitted" && escrow.submissionCid && isClient && !submissionMeta && !loadingSubmission) {
      setLoadingSubmission(true)
      fetchSubmissionMetadata(escrow.submissionCid).then((meta) => {
        setSubmissionMeta(meta)
        setLoadingSubmission(false)
      })
    }
  }, [escrow.status, escrow.submissionCid, isClient, submissionMeta, loadingSubmission])

  const runAction = async (label: string, fn: () => Promise<any>) => {
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

  const verifyGithub = async () => {
    if (!githubUrl.trim()) return
    setVerifying(true)
    setVerification(null)
    try {
      const res = await fetch("/api/verify-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl: githubUrl.trim(), techstack }),
      })
      const data = await res.json()
      setVerification(data)
    } catch {
      setVerification({
        verified: false,
        hasCode: false,
        commitCount: 0,
        languages: {},
        techstackMatch: [],
        repoName: "",
        error: "Failed to verify repository",
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmitWork = async () => {
    // Build submission metadata
    const submissionMetadata: SubmissionMetadata = {
      version: 1,
      files: uploadedFiles.map((f) => ({
        name: f.name,
        cid: f.cid,
        size: f.size,
        mimeType: f.mimeType,
      })),
    }

    if (githubUrl.trim()) submissionMetadata.githubUrl = githubUrl.trim()
    if (checklistCompleted.length > 0) submissionMetadata.checklistCompleted = checklistCompleted
    if (verification) {
      submissionMetadata.verification = {
        verified: verification.verified,
        techstackMatch: verification.techstackMatch,
        hasCode: verification.hasCode,
        commitCount: verification.commitCount,
        languages: verification.languages,
      }
    }

    // Upload submission metadata to IPFS
    const blob = new Blob([JSON.stringify(submissionMetadata)], {
      type: "application/json",
    })
    const form = new FormData()
    form.append("file", blob, "submission.json")

    const uploadRes = await fetch("/api/upload", { method: "POST", body: form })
    if (!uploadRes.ok) throw new Error("Failed to upload submission metadata")
    const { cid } = await uploadRes.json()

    await submitWork(wallet, escrow.publicKey.toBase58(), cid)
    setShowSubmitDialog(false)
    setUploadedFiles([])
    setGithubUrl("")
    setVerification(null)
    setChecklistCompleted([])
  }

  const truncate = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-4">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white truncate">{title}</h3>
              {deadline && <DeadlineBadge deadline={deadline} />}
              <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
            </div>
            {desc && (
              <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{desc}</p>
            )}
          </div>
          <StatusBadge status={escrow.status} />
        </div>

        {/* Tech Stack Chips (visible even when collapsed) */}
        {techstack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {techstack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-xs border border-blue-500/25"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

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

          {/* Deadline */}
          {deadline && (
            <div>
              <span className="text-neutral-500 text-xs">Deadline</span>
              <div className="text-neutral-300 text-xs mt-0.5">
                {new Date(deadline).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
          )}

          {desc && (
            <div>
              <span className="text-neutral-500 text-xs">Full Description</span>
              <p className="text-neutral-300 text-xs mt-0.5 whitespace-pre-wrap">{desc}</p>
            </div>
          )}

          {/* Requirements */}
          {requirements.length > 0 && (
            <div>
              <span className="text-neutral-500 text-xs">Requirements</span>
              <div className="space-y-1 mt-1">
                {requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                    <span className="text-neutral-500 shrink-0">{i + 1}.</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Attached files */}
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

      {/* Enhanced Proof Review */}
      {escrow.status === "Submitted" && escrow.submissionCid && isClient && (
        <div className="rounded-lg border border-purple-800/50 bg-purple-900/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-300">
            <Eye className="w-4 h-4" />
            Proof of Work Submitted
          </div>

          {loadingSubmission && (
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading submission details...
            </div>
          )}

          {submissionMeta && (
            <div className="space-y-2">
              {/* Submitted files */}
              {submissionMeta.files.length > 0 && (
                <div>
                  <span className="text-xs text-neutral-400">Submitted Files</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {submissionMeta.files.map((f) => (
                      <a
                        key={f.cid}
                        href={getFileUrl(f.cid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-800/30 text-xs text-purple-200 hover:bg-purple-700/40 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        {f.name}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub link with verification */}
              {submissionMeta.githubUrl && (
                <div>
                  <span className="text-xs text-neutral-400">GitHub Repository</span>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={submissionMeta.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 text-xs text-neutral-200 hover:bg-neutral-700 transition-colors"
                    >
                      <Github className="w-3 h-3" />
                      {submissionMeta.githubUrl.replace("https://github.com/", "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {submissionMeta.verification && (
                      submissionMeta.verification.hasCode ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 text-xs border border-green-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Code Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" />
                          README only
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Verification details */}
              {submissionMeta.verification && (
                <div className="rounded-md bg-neutral-800/50 p-3 space-y-2">
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-neutral-400">
                      Commits: <span className="text-white">{submissionMeta.verification.commitCount}</span>
                    </span>
                    {submissionMeta.verification.techstackMatch.length > 0 && (
                      <span className="text-neutral-400">
                        Tech matched:{" "}
                        <span className="text-green-300">
                          {submissionMeta.verification.techstackMatch.join(", ")}
                        </span>
                      </span>
                    )}
                  </div>
                  {Object.keys(submissionMeta.verification.languages).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(submissionMeta.verification.languages).map(([lang, pct]) => (
                        <span key={lang} className="px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-300 text-xs">
                          {lang} {pct}%
                        </span>
                      ))}
                    </div>
                  )}
                  {!submissionMeta.verification.hasCode && (
                    <p className="text-xs text-amber-300">
                      Warning: Repository may only contain README or config files
                    </p>
                  )}
                </div>
              )}

              {/* Requirements completion */}
              {submissionMeta.checklistCompleted && requirements.length > 0 && (
                <div>
                  <span className="text-xs text-neutral-400">Requirements Completion</span>
                  <div className="space-y-1 mt-1">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {submissionMeta.checklistCompleted?.[i] ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        )}
                        <span className={submissionMeta.checklistCompleted?.[i] ? "text-neutral-300" : "text-neutral-500"}>
                          {req}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!submissionMeta && !loadingSubmission && (
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
          )}
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
        {escrow.status === "Open" && !isClient && onViewDetails && (
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetails}
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white gap-1.5"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Button>
        )}
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

      {/* Enhanced Submit Work Dialog */}
      {showSubmitDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Submit Work with Proof</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-400 hover:text-white"
                onClick={() => {
                  setShowSubmitDialog(false)
                  setUploadedFiles([])
                  setGithubUrl("")
                  setVerification(null)
                  setChecklistCompleted([])
                  setError("")
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-neutral-400">
              Upload your work files, link your GitHub repository, and complete the requirements checklist.
            </p>

            {/* File Upload */}
            <div>
              <label className="text-sm text-neutral-300 mb-2 block">Files</label>
              <FileUpload onFilesChange={setUploadedFiles} maxFiles={5} />
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <label className="text-sm text-neutral-300">GitHub Repository (optional)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://github.com/owner/repo"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value)
                    setVerification(null)
                  }}
                  className="bg-neutral-800 border-neutral-700 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={verifyGithub}
                  disabled={!githubUrl.trim() || verifying}
                  className="border-neutral-700 shrink-0"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-1" />
                      Verify
                    </>
                  )}
                </Button>
              </div>

              {/* Verification Result */}
              {verification && (
                <div className="rounded-lg border p-3 space-y-2 text-xs" style={{
                  borderColor: verification.error ? "#ef4444" : verification.hasCode ? "#22c55e" : "#f59e0b",
                  backgroundColor: verification.error ? "rgba(239,68,68,0.1)" : verification.hasCode ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                }}>
                  <div className="flex items-center gap-2">
                    {verification.error ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : verification.hasCode ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-medium">
                      {verification.error
                        ? verification.error
                        : verification.hasCode
                        ? "Repository contains actual code"
                        : "Warning: No source code found (may be README only)"}
                    </span>
                  </div>

                  {!verification.error && (
                    <>
                      <div className="flex flex-wrap gap-3 text-neutral-300">
                        <span>Commits: <span className="text-white">{verification.commitCount}</span></span>
                        <span>Repo: <span className="text-white">{verification.repoName}</span></span>
                      </div>
                      {Object.keys(verification.languages).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(verification.languages).map(([lang, pct]) => (
                            <span key={lang} className="px-2 py-0.5 rounded-full bg-neutral-700 text-neutral-200">
                              {lang} {pct}%
                            </span>
                          ))}
                        </div>
                      )}
                      {verification.techstackMatch.length > 0 && (
                        <div className="text-green-300">
                          Tech matched: {verification.techstackMatch.join(", ")}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Requirements Checklist */}
            {requirements.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-neutral-300">Requirements Checklist</label>
                <div className="space-y-1.5">
                  {requirements.map((req, i) => (
                    <label
                      key={i}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700 cursor-pointer hover:bg-neutral-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checklistCompleted[i] || false}
                        onChange={(e) => {
                          const next = [...checklistCompleted]
                          next[i] = e.target.checked
                          setChecklistCompleted(next)
                        }}
                        className="mt-0.5 accent-green-500"
                      />
                      <span className="text-sm text-neutral-300">{req}</span>
                    </label>
                  ))}
                </div>
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
              onClick={() => runAction("Submit", handleSubmitWork)}
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
