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
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

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

  const amountNum = parseFloat(amount) || 0

  const uploadMetadataToIpfs = useCallback(
    async (
      title: string,
      description: string,
      files: UploadedFile[]
    ): Promise<string> => {
      const metadata = {
        version: 1,
        title,
        description,
        files: files.map((f) => ({
          name: f.name,
          cid: f.cid,
          size: f.size,
          mimeType: f.mimeType,
        })),
      }

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
    []
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
        // If we have a title, description, or files — upload metadata to IPFS
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

        const result = await createEscrow(
          wallet,
          amountNum,
          onChainDescription,
          receiver.trim() || undefined
        )

        setSuccess(`Escrow created! TX: ${result.signature.slice(0, 16)}...`)
        setTitle("")
        setDescription("")
        setAmount("")
        setReceiver("")
        setFiles([])
        onSuccess?.()
      } catch (err: any) {
        setError(err.message || "Failed to create escrow")
      } finally {
        setSubmitting(false)
      }
    },
    [wallet, title, description, amount, amountNum, receiver, files, uploadMetadataToIpfs, onSuccess]
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

      <div className="space-y-2">
        <Label htmlFor="receiver">Receiver wallet (optional)</Label>
        <Input
          id="receiver"
          placeholder="Leave blank for open escrow anyone can accept"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          className="bg-neutral-900 border-neutral-700 font-mono text-sm"
        />
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
