"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Shield,
  Plus,
  FolderOpen,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Wallet,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  Clock,
  XCircle,
  Play,
  Send,
} from "lucide-react"
import {
  createEscrow,
  releaseFunds,
  cancelEscrow,
  fetchClientEscrows,
  getWalletBalance,
  requestAirdrop,
  lamportsToSol,
  getAddressExplorerUrl,
  type EscrowAccount,
  type EscrowStatus,
} from "@/lib/solana"
import { EscrowFlow } from "@/components/EscrowFlow"

export default function ClientDashboard() {
  const wallet = useWallet()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [balance, setBalance] = useState<number>(0)
  const [escrows, setEscrows] = useState<EscrowAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Create escrow form
  const [amount, setAmount] = useState("0.1")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (wallet.connected) {
      refreshData()
    }
  }, [wallet.connected])

  const refreshData = async () => {
    if (!wallet.connected) return
    setLoading(true)
    try {
      const [bal, userEscrows] = await Promise.all([
        getWalletBalance(wallet),
        fetchClientEscrows(wallet),
      ])
      setBalance(bal)
      setEscrows(userEscrows)
    } catch (e: any) {
      console.error("Error refreshing data:", e)
    } finally {
      setLoading(false)
    }
  }

  const handleAirdrop = async () => {
    setActionLoading("airdrop")
    setError(null)
    try {
      await requestAirdrop(wallet, 2)
      await refreshData()
      setSuccess("Airdropped 2 SOL successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (e: any) {
      setError(e.message || "Airdrop failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateEscrow = async () => {
    if (!description.trim()) {
      setError("Please enter a task description")
      return
    }
    setActionLoading("create")
    setError(null)
    try {
      const result = await createEscrow(wallet, parseFloat(amount), description)
      await refreshData()
      setSuccess(`Escrow created! View on Explorer`)
      setDescription("")
      setAmount("0.1")
      setTimeout(() => setSuccess(null), 5000)
    } catch (e: any) {
      setError(e.message || "Failed to create escrow")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReleaseFunds = async (escrow: EscrowAccount) => {
    setActionLoading(escrow.publicKey.toBase58())
    setError(null)
    try {
      await releaseFunds(
        wallet,
        escrow.publicKey.toBase58(),
        escrow.freelancer.toBase58()
      )
      await refreshData()
      setSuccess("Funds released successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (e: any) {
      setError(e.message || "Failed to release funds")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelEscrow = async (escrow: EscrowAccount) => {
    setActionLoading(escrow.publicKey.toBase58())
    setError(null)
    try {
      await cancelEscrow(wallet, escrow.publicKey.toBase58())
      await refreshData()
      setSuccess("Escrow cancelled and refunded!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (e: any) {
      setError(e.message || "Failed to cancel escrow")
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: EscrowStatus) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-neutral-800 text-neutral-300 border-neutral-700">Open</Badge>
      case "InProgress":
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">In Progress</Badge>
      case "Submitted":
        return <Badge className="bg-white/10 text-white border-white/30">Submitted</Badge>
      case "Completed":
        return <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Completed</Badge>
      case "Cancelled":
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/30">Cancelled</Badge>
      case "Disputed":
        return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">Disputed</Badge>
    }
  }

  const stats = [
    { label: "Wallet Balance", value: `${balance.toFixed(4)} SOL`, icon: Wallet },
    { label: "Total Escrows", value: escrows.length.toString(), icon: FolderOpen },
    { label: "Active", value: escrows.filter((e) => e.status === "InProgress" || e.status === "Submitted").length.toString(), icon: Clock },
    { label: "Completed", value: escrows.filter((e) => e.status === "Completed").length.toString(), icon: CheckCircle },
  ]

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Card className="bg-neutral-900 border-neutral-800 max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription className="text-neutral-400">
              Connect your Phantom wallet to access the client dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <WalletMultiButton className="!bg-white !text-black hover:!bg-neutral-200" />
            <Button
              variant="outline"
              className="border-neutral-700 text-white hover:bg-neutral-800 bg-transparent"
              onClick={() => router.push("/demo")}
            >
              <Play className="w-4 h-4 mr-2" />
              Try Demo First
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Trustify</span>
              </Link>
              <Badge className="bg-neutral-800 text-neutral-300 border-neutral-700">Client</Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-neutral-400">
                <Wallet className="w-4 h-4" />
                <span className="font-mono text-sm">{balance.toFixed(4)} SOL</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshData}
                  disabled={loading}
                  className="h-6 w-6 text-neutral-500 hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <WalletMultiButton className="!bg-white !text-black hover:!bg-neutral-200 !h-9 !text-sm" />
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <Card className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {[
                      { id: "overview", label: "Dashboard", icon: TrendingUp },
                      { id: "escrows", label: "My Escrows", icon: FolderOpen },
                      { id: "create", label: "Create Escrow", icon: Plus },
                    ].map((item) => (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={`w-full justify-start ${
                          activeTab === item.id
                            ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                        }`}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.label}
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Devnet Tools */}
              <Card className="bg-neutral-900 border-neutral-800 mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm">Devnet Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={handleAirdrop}
                    disabled={actionLoading === "airdrop"}
                    className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                  >
                    {actionLoading === "airdrop" ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <DollarSign className="w-4 h-4 mr-2" />
                    )}
                    Airdrop 2 SOL
                  </Button>
                  <p className="text-neutral-500 text-xs text-center">Free devnet SOL for testing</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
                    <p className="text-neutral-400">Manage your escrows and track payments</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                      <Card key={index} className="bg-neutral-900 border-neutral-800">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-neutral-500 text-sm">{stat.label}</p>
                              <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center">
                              <stat.icon className="w-5 h-5 text-neutral-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Recent Escrows */}
                  <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Recent Escrows</CardTitle>
                        <Button
                          variant="ghost"
                          className="text-neutral-400 hover:text-white"
                          onClick={() => setActiveTab("escrows")}
                        >
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {escrows.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FolderOpen className="w-8 h-8 text-neutral-600" />
                          </div>
                          <p className="text-neutral-400 mb-4">No escrows yet</p>
                          <Button
                            className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                            onClick={() => setActiveTab("create")}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Escrow
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {escrows.slice(0, 3).map((escrow) => (
                            <div
                              key={escrow.publicKey.toBase58()}
                              className="p-4 bg-neutral-800/50 rounded-xl border border-neutral-800"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-medium truncate max-w-xs">
                                    {escrow.description}
                                  </p>
                                  <p className="text-neutral-400 text-sm font-mono">
                                    {lamportsToSol(escrow.amount)} SOL
                                  </p>
                                </div>
                                {getStatusBadge(escrow.status)}
                              </div>
                              <a
                                href={getAddressExplorerUrl(escrow.publicKey.toBase58())}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-neutral-500 hover:text-white text-xs flex items-center gap-1 transition-colors"
                              >
                                View on Explorer <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "escrows" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">My Escrows</h2>
                    <Button
                      onClick={refreshData}
                      disabled={loading}
                      variant="outline"
                      className="border-neutral-700 text-white hover:bg-neutral-800 bg-transparent"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>

                  {escrows.length === 0 ? (
                    <Card className="bg-neutral-900 border-neutral-800">
                      <CardContent className="py-12 text-center">
                        <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FolderOpen className="w-8 h-8 text-neutral-600" />
                        </div>
                        <p className="text-neutral-400 mb-4">No escrows found</p>
                        <Button
                          className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                          onClick={() => setActiveTab("create")}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Escrow
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {escrows.map((escrow) => (
                        <Card
                          key={escrow.publicKey.toBase58()}
                          className="bg-neutral-900 border-neutral-800"
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-lg">
                                    {escrow.description}
                                  </h3>
                                  {getStatusBadge(escrow.status)}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                  <div>
                                    <p className="text-neutral-500">Amount</p>
                                    <p className="font-mono">
                                      {lamportsToSol(escrow.amount)} SOL
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-neutral-500">Freelancer</p>
                                    <p className="font-mono text-xs">
                                      {escrow.freelancer.toBase58() === "11111111111111111111111111111111"
                                        ? "Not assigned"
                                        : `${escrow.freelancer.toBase58().slice(0, 8)}...`}
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href={getAddressExplorerUrl(escrow.publicKey.toBase58())}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-neutral-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
                                >
                                  View on Solana Explorer <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              <div className="flex flex-col gap-2">
                                {escrow.status === "Open" && (
                                  <Button
                                    onClick={() => handleCancelEscrow(escrow)}
                                    disabled={actionLoading === escrow.publicKey.toBase58()}
                                    variant="outline"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                                  >
                                    {actionLoading === escrow.publicKey.toBase58() ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <XCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Cancel & Refund
                                  </Button>
                                )}
                                {(escrow.status === "Submitted" || escrow.status === "InProgress") && (
                                  <Button
                                    onClick={() => handleReleaseFunds(escrow)}
                                    disabled={actionLoading === escrow.publicKey.toBase58()}
                                    className="bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                                  >
                                    {actionLoading === escrow.publicKey.toBase58() ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Send className="w-4 h-4 mr-2" />
                                    )}
                                    Release Funds
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Escrow Flow Visualization */}
                            <div className="mt-6 pt-6 border-t border-neutral-800">
                              <EscrowFlow
                                status={escrow.status}
                                amount={lamportsToSol(escrow.amount)}
                                clientAddress={escrow.client.toBase58()}
                                freelancerAddress={
                                  escrow.freelancer.toBase58() !== "11111111111111111111111111111111"
                                    ? escrow.freelancer.toBase58()
                                    : undefined
                                }
                                compact
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "create" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Create New Escrow</h2>
                    <p className="text-neutral-400">
                      Deposit SOL into a secure escrow vault. Funds are locked until you release them.
                    </p>
                  </div>

                  <Card className="bg-neutral-900 border-neutral-800 max-w-xl">
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <label className="text-neutral-400 text-sm mb-2 block">Amount (SOL)</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-neutral-800 border-neutral-700 text-white"
                          placeholder="0.1"
                        />
                        <p className="text-neutral-500 text-xs mt-1">
                          Available: {balance.toFixed(4)} SOL
                        </p>
                      </div>

                      <div>
                        <label className="text-neutral-400 text-sm mb-2 block">Task Description</label>
                        <Input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-neutral-800 border-neutral-700 text-white"
                          placeholder="Describe the task for the freelancer..."
                          maxLength={200}
                        />
                        <p className="text-neutral-500 text-xs mt-1">
                          {description.length}/200 characters
                        </p>
                      </div>

                      <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg">
                        <p className="text-neutral-300 text-sm">
                          {parseFloat(amount)} SOL will be transferred to a secure PDA vault.
                          Only you can release these funds to the freelancer.
                        </p>
                      </div>

                      <Button
                        onClick={handleCreateEscrow}
                        disabled={actionLoading === "create" || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                        className="w-full bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                      >
                        {actionLoading === "create" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating Escrow...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Create Escrow
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
