"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createEscrow, getWalletBalance } from "@/lib/solana"
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Wallet,
  Loader2,
} from "lucide-react"

export default function PostProjectPage() {
  const router = useRouter()
  const wallet = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setError("Please connect your Phantom wallet first!")
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!description.trim()) {
      setError("Please enter a task description")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const balance = await getWalletBalance(wallet)
      if (parseFloat(amount) > balance) {
        setError(`Insufficient balance. You have ${balance.toFixed(4)} SOL`)
        setIsSubmitting(false)
        return
      }

      const result = await createEscrow(wallet, parseFloat(amount), description)
      console.log("Escrow created:", result)
      router.push("/dashboard/client")
    } catch (err: any) {
      console.error("Error creating escrow:", err)
      setError(err.message || "Failed to create escrow")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500" />
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => router.push("/dashboard/client")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/client" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Trustify</span>
              </Link>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Create Escrow</Badge>
            </div>
            <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/client")}
          className="text-white/70 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Create New Escrow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="amount" className="text-white">
                Amount (SOL)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                placeholder="0.1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">
                Task Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white/10 border-white/20 text-white min-h-32"
                placeholder="Describe the task for the freelancer..."
                maxLength={200}
              />
              <p className="text-white/50 text-xs mt-1">{description.length}/200 characters</p>
            </div>

            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 text-sm">
                {parseFloat(amount) || 0} SOL will be transferred to a secure PDA vault.
                Only you can release these funds to the freelancer.
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Escrow...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Escrow
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
