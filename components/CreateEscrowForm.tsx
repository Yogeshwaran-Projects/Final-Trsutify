"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileUpload, type UploadedFile } from "@/components/FileUpload"
import { SolAmount } from "@/components/SolAmount"
import { createEscrow } from "@/lib/solana"
import type { EscrowMetadata } from "@/lib/ipfs"
import { Loader2, CheckCircle, AlertCircle, ChevronDown, X, Plus } from "lucide-react"

interface CreateEscrowFormProps {
  onSuccess?: () => void
}

export function CreateEscrowForm({ onSuccess }: CreateEscrowFormProps) {
  const wallet = useWallet()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [receiver, setReceiver] = useState("")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // New v2 fields
  const [deadline, setDeadline] = useState("")
  const [receiverMode, setReceiverMode] = useState<"open" | "directed">("open")
  const [whitelist, setWhitelist] = useState("")
  const [blocklist, setBlocklist] = useState("")
  const [techstack, setTechstack] = useState<string[]>([])
  const [techInput, setTechInput] = useState("")
  const [requirements, setRequirements] = useState<string[]>([])
  const [reqInput, setReqInput] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const amountNum = parseFloat(amount) || 0

  const addTechTag = () => {
    const tag = techInput.trim()
    if (tag && !techstack.includes(tag)) {
      setTechstack([...techstack, tag])
    }
    setTechInput("")
  }

  const addRequirement = () => {
    const req = reqInput.trim()
    if (req) {
      setRequirements([...requirements, req])
    }
    setReqInput("")
  }

  const parseAddressList = (text: string): string[] => {
    return text
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }

  const uploadMetadataToIpfs = useCallback(
    async (
      title: string,
      description: string,
      files: UploadedFile[]
    ): Promise<string> => {
      const metadata: EscrowMetadata = {
        version: 2,
        title,
        description,
        files: files.map((f) => ({
          name: f.name,
          cid: f.cid,
          size: f.size,
          mimeType: f.mimeType,
        })),
      }

      // Add v2 fields if present
      if (deadline) metadata.deadline = new Date(deadline).toISOString()
      metadata.receiverMode = receiverMode
      const wl = parseAddressList(whitelist)
      if (wl.length > 0) metadata.whitelist = wl
      const bl = parseAddressList(blocklist)
      if (bl.length > 0) metadata.blocklist = bl
      if (techstack.length > 0) metadata.techstack = techstack
      if (requirements.length > 0) metadata.requirements = requirements

      const blob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      })
      const form = new FormData()
      form.append("file", blob, "metadata.json")

      const res = await fetch("/api/upload", { method: "POST", body: form })
      if (!res.ok) throw new Error("Failed to upload metadata")
      const data = await res.json()
      return data.cid
    },
    [deadline, receiverMode, whitelist, blocklist, techstack, requirements]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!wallet.publicKey) {
        setError("Please connect your wallet")
        return
      }
      if (!title.trim()) {
        setError("Title is required")
        return
      }
      if (amountNum <= 0) {
        setError("Amount must be greater than 0")
        return
      }

      setSubmitting(true)
      setError("")
      setSuccess("")

      try {
        const hasRichContent =
          description.trim().length > 0 || files.length > 0

        let onChainDescription: string
        if (hasRichContent || title.trim().length > 0) {
          const cid = await uploadMetadataToIpfs(
            title.trim(),
            description.trim(),
            files
          )
          onChainDescription = `ipfs://${cid}`
        } else {
          onChainDescription = title.trim().slice(0, 200)
        }

        const receiverAddr =
          receiverMode === "directed" ? receiver.trim() || undefined : undefined

        const result = await createEscrow(
          wallet,
          amountNum,
          onChainDescription,
          receiverAddr
        )

        setSuccess(`Escrow created! TX: ${result.signature.slice(0, 16)}...`)
        setTitle("")
        setDescription("")
        setAmount("")
        setReceiver("")
        setFiles([])
        setDeadline("")
        setReceiverMode("open")
        setWhitelist("")
        setBlocklist("")
        setTechstack([])
        setRequirements([])
        setShowAdvanced(false)
        onSuccess?.()
      } catch (err: any) {
        setError(err.message || "Failed to create escrow")
      } finally {
        setSubmitting(false)
      }
    },
    [wallet, title, description, amount, amountNum, receiver, receiverMode, files, uploadMetadataToIpfs, onSuccess]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Logo Design, Website Development"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-neutral-900 border-neutral-700"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of the work or payment..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-neutral-900 border-neutral-700 min-h-[100px]"
          maxLength={1000}
        />
        <p className="text-xs text-neutral-500">{description.length}/1000</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (SOL)</Label>
        <Input
          id="amount"
          type="number"
          step="0.001"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-neutral-900 border-neutral-700"
        />
        {amountNum > 0 && (
          <div className="text-sm">
            <SolAmount sol={amountNum} />
          </div>
        )}
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="bg-neutral-900 border-neutral-700"
        />
      </div>

      {/* Receiver Mode Toggle */}
      <div className="space-y-3">
        <Label>Receiver Mode</Label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setReceiverMode("open")}
            className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              receiverMode === "open"
                ? "bg-white text-black border-white"
                : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500"
            }`}
          >
            Open (anyone can accept)
          </button>
          <button
            type="button"
            onClick={() => setReceiverMode("directed")}
            className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              receiverMode === "directed"
                ? "bg-white text-black border-white"
                : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500"
            }`}
          >
            Directed (specific wallet)
          </button>
        </div>
      </div>

      {/* Receiver wallet - only shown when directed */}
      {receiverMode === "directed" && (
        <div className="space-y-2">
          <Label htmlFor="receiver">Receiver wallet address</Label>
          <Input
            id="receiver"
            placeholder="Enter the receiver's wallet address"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="bg-neutral-900 border-neutral-700 font-mono text-sm"
          />
        </div>
      )}

      {/* Tech Stack Tags */}
      <div className="space-y-2">
        <Label>Tech Stack (optional)</Label>
        <div className="flex gap-2">
          <Input
            placeholder='e.g. React, Solana, Rust — press Enter'
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTechTag()
              }
            }}
            className="bg-neutral-900 border-neutral-700"
          />
          <Button type="button" variant="outline" size="sm" onClick={addTechTag} className="border-neutral-700 shrink-0">
            Add
          </Button>
        </div>
        {techstack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {techstack.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTechstack(techstack.filter((t) => t !== tag))}
                  className="hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <Label>Requirements Checklist (optional)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a requirement..."
            value={reqInput}
            onChange={(e) => setReqInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addRequirement()
              }
            }}
            className="bg-neutral-900 border-neutral-700"
          />
          <Button type="button" variant="outline" size="sm" onClick={addRequirement} className="border-neutral-700 shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {requirements.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {requirements.map((req, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800/50 border border-neutral-700 text-sm text-neutral-300"
              >
                <span className="text-neutral-500 text-xs">{i + 1}.</span>
                <span className="flex-1">{req}</span>
                <button
                  type="button"
                  onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}
                  className="text-neutral-500 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Options (collapsible) */}
      <div className="border border-neutral-800 rounded-lg">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <span>Advanced Options</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
        </button>

        {showAdvanced && (
          <div className="px-4 pb-4 space-y-4 border-t border-neutral-800 pt-4">
            {/* Whitelist */}
            {receiverMode === "open" && (
              <div className="space-y-2">
                <Label htmlFor="whitelist">Whitelist (optional)</Label>
                <Textarea
                  id="whitelist"
                  placeholder="Comma-separated wallet addresses allowed to accept this escrow"
                  value={whitelist}
                  onChange={(e) => setWhitelist(e.target.value)}
                  className="bg-neutral-900 border-neutral-700 min-h-[60px] font-mono text-xs"
                />
                {parseAddressList(whitelist).length > 0 && (
                  <p className="text-xs text-neutral-500">
                    {parseAddressList(whitelist).length} address(es) whitelisted
                  </p>
                )}
              </div>
            )}

            {/* Blocklist */}
            {receiverMode === "open" && (
              <div className="space-y-2">
                <Label htmlFor="blocklist">Blocklist (optional)</Label>
                <Textarea
                  id="blocklist"
                  placeholder="Comma-separated wallet addresses blocked from accepting this escrow"
                  value={blocklist}
                  onChange={(e) => setBlocklist(e.target.value)}
                  className="bg-neutral-900 border-neutral-700 min-h-[60px] font-mono text-xs"
                />
                {parseAddressList(blocklist).length > 0 && (
                  <p className="text-xs text-neutral-500">
                    {parseAddressList(blocklist).length} address(es) blocklisted
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Attachments (optional)</Label>
        <FileUpload onFilesChange={setFiles} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      <Button
        type="submit"
        disabled={submitting || !wallet.publicKey}
        className="w-full bg-white text-black hover:bg-neutral-200"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Escrow...
          </>
        ) : (
          "Create Escrow"
        )}
      </Button>
    </form>
  )
}
