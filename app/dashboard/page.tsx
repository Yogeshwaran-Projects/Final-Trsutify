"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import {
  fetchClientEscrows,
  fetchFreelancerEscrows,
  fetchOpenEscrows,
  lamportsToSol,
  type EscrowAccount,
  type EscrowStatus,
} from "@/lib/solana"
import { useEscrowMetadata } from "@/hooks/useEscrowMetadata"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/DashboardHeader"
import { CreateEscrowForm } from "@/components/CreateEscrowForm"
import { EscrowCard } from "@/components/EscrowCard"
import { SolAmount } from "@/components/SolAmount"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LayoutDashboard,
  Send,
  Download,
  FolderOpen,
  Loader2,
  Wallet,
  RefreshCw,
} from "lucide-react"

type StatusFilter = "all" | EscrowStatus

export default function DashboardPage() {
  const wallet = useWallet()
  const isMobile = useIsMobile()

  const [clientEscrows, setClientEscrows] = useState<EscrowAccount[]>([])
  const [freelancerEscrows, setFreelancerEscrows] = useState<EscrowAccount[]>(
    []
  )
  const [openEscrows, setOpenEscrows] = useState<EscrowAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  // Resolve metadata for all escrows
  const allRaw = [...clientEscrows, ...freelancerEscrows, ...openEscrows]
  const uniqueMap = new Map<string, EscrowAccount>()
  allRaw.forEach((e) => uniqueMap.set(e.publicKey.toBase58(), e))
  const uniqueEscrows = Array.from(uniqueMap.values())
  const { escrows: resolvedAll } = useEscrowMetadata(uniqueEscrows)

  // Re-map resolved metadata back onto categorized arrays
  const resolvedMap = new Map<string, EscrowAccount>()
  resolvedAll.forEach((e) => resolvedMap.set(e.publicKey.toBase58(), e))

  const getResolved = (arr: EscrowAccount[]) =>
    arr.map((e) => resolvedMap.get(e.publicKey.toBase58()) ?? e)

  const rClientEscrows = getResolved(clientEscrows)
  const rFreelancerEscrows = getResolved(freelancerEscrows)
  const rOpenEscrows = getResolved(openEscrows)

  const fetchAll = useCallback(async () => {
    if (!wallet.publicKey) return
    setLoading(true)
    try {
      const [client, freelancer, open] = await Promise.all([
        fetchClientEscrows(wallet),
        fetchFreelancerEscrows(wallet),
        fetchOpenEscrows(wallet),
      ])
      setClientEscrows(client)
      setFreelancerEscrows(freelancer)
      setOpenEscrows(open)
    } catch {
      // ignore
    }
    setLoading(false)
  }, [wallet])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Stats
  const totalSent = rClientEscrows.reduce(
    (acc, e) => acc + lamportsToSol(e.amount),
    0
  )
  const totalReceived = rFreelancerEscrows
    .filter((e) => e.status === "Completed")
    .reduce((acc, e) => acc + lamportsToSol(e.amount), 0)
  const activeCount =
    rClientEscrows.filter(
      (e) => e.status !== "Completed" && e.status !== "Cancelled"
    ).length +
    rFreelancerEscrows.filter(
      (e) => e.status !== "Completed" && e.status !== "Cancelled"
    ).length

  // My escrows (combined + deduplicated)
  const myEscrowsMap = new Map<string, EscrowAccount & { role: string }>()
  rClientEscrows.forEach((e) =>
    myEscrowsMap.set(e.publicKey.toBase58(), { ...e, role: "Sender" })
  )
  rFreelancerEscrows.forEach((e) => {
    const key = e.publicKey.toBase58()
    if (myEscrowsMap.has(key)) return
    myEscrowsMap.set(key, { ...e, role: "Receiver" })
  })
  let myEscrows = Array.from(myEscrowsMap.values())
  if (statusFilter !== "all") {
    myEscrows = myEscrows.filter((e) => e.status === statusFilter)
  }

  // Receive tab: open escrows not created by current user, filtered by whitelist/blocklist
  const myWallet = wallet.publicKey?.toBase58() ?? ""
  const receivableEscrows = rOpenEscrows.filter((e) => {
    if (e.client.toBase58() === myWallet) return false
    // Whitelist check: if escrow has a whitelist and wallet not in it, hide
    if (e.metadata?.whitelist && e.metadata.whitelist.length > 0) {
      if (!e.metadata.whitelist.includes(myWallet)) return false
    }
    // Blocklist check: if escrow has a blocklist and wallet is in it, hide
    if (e.metadata?.blocklist && e.metadata.blocklist.length > 0) {
      if (e.metadata.blocklist.includes(myWallet)) return false
    }
    return true
  })
  // Also escrows directed to this user
  const directedToMe = rOpenEscrows.filter(
    (e) =>
      !e.freelancer.toBuffer().every((b) => b === 0) &&
      e.freelancer.toBase58() === wallet.publicKey?.toBase58()
  )

  if (!wallet.publicKey) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <DashboardHeader />
          <div className="flex flex-col items-center justify-center mt-32 gap-4">
            <Wallet className="w-12 h-12 text-neutral-600" />
            <h2 className="text-xl font-semibold">Connect your wallet</h2>
            <p className="text-neutral-400 text-center max-w-md">
              Connect a Solana wallet to create escrows, send payments, and
              manage your transactions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const tabOrientation = isMobile ? "horizontal" : "vertical"

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <DashboardHeader onRefresh={fetchAll} />

        <div className="mt-8">
          <Tabs
            defaultValue="overview"
            orientation={tabOrientation}
            className={
              isMobile
                ? ""
                : "flex gap-8"
            }
          >
            {/* Sidebar / Top tabs */}
            <TabsList
              className={
                isMobile
                  ? "w-full grid grid-cols-4 bg-neutral-900 border border-neutral-800 h-auto p-1"
                  : "flex flex-col h-fit w-56 shrink-0 bg-neutral-900 border border-neutral-800 p-2 rounded-xl gap-1"
              }
            >
              <TabsTrigger
                value="overview"
                className={
                  isMobile
                    ? "text-xs gap-1 data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                    : "justify-start gap-2 w-full data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                {!isMobile && "Overview"}
              </TabsTrigger>
              <TabsTrigger
                value="send"
                className={
                  isMobile
                    ? "text-xs gap-1 data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                    : "justify-start gap-2 w-full data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                }
              >
                <Send className="w-4 h-4" />
                {!isMobile && "Send Payment"}
              </TabsTrigger>
              <TabsTrigger
                value="receive"
                className={
                  isMobile
                    ? "text-xs gap-1 data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                    : "justify-start gap-2 w-full data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                }
              >
                <Download className="w-4 h-4" />
                {!isMobile && "Receive Payment"}
              </TabsTrigger>
              <TabsTrigger
                value="escrows"
                className={
                  isMobile
                    ? "text-xs gap-1 data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                    : "justify-start gap-2 w-full data-[state=active]:bg-neutral-800 data-[state=active]:text-white"
                }
              >
                <FolderOpen className="w-4 h-4" />
                {!isMobile && "My Escrows"}
              </TabsTrigger>
            </TabsList>

            {/* Content */}
            <div className="flex-1 min-w-0 mt-6 md:mt-0">
              {loading && (
                <div className="flex items-center gap-2 text-neutral-400 mb-6">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading escrows...
                </div>
              )}

              {/* Overview */}
              <TabsContent value="overview" className="space-y-8">
                <h2 className="text-2xl font-bold">Overview</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Sent"
                    value={<SolAmount sol={totalSent} showFiat={false} />}
                  />
                  <StatCard
                    label="Total Received"
                    value={<SolAmount sol={totalReceived} showFiat={false} />}
                  />
                  <StatCard label="Active Escrows" value={activeCount} />
                  <StatCard
                    label="Available"
                    value={receivableEscrows.length}
                  />
                </div>

                {/* Recent activity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Recent Activity
                  </h3>
                  {myEscrows.length === 0 && !loading ? (
                    <p className="text-neutral-500">
                      No escrows yet. Create one from the &quot;Send Payment&quot;
                      tab.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {myEscrows.slice(0, 5).map((e) => (
                        <EscrowCard
                          key={e.publicKey.toBase58()}
                          escrow={e}
                          onAction={fetchAll}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Send Payment */}
              <TabsContent value="send" className="space-y-6">
                <h2 className="text-2xl font-bold">Send Payment</h2>
                <p className="text-neutral-400">
                  Create an escrow to securely send SOL. Funds are locked in a
                  smart contract until the work is completed.
                </p>
                <CreateEscrowForm onSuccess={fetchAll} />
              </TabsContent>

              {/* Receive Payment */}
              <TabsContent value="receive" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Receive Payment</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchAll}
                    disabled={loading}
                    className="text-neutral-400 hover:text-white gap-1.5"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
                <p className="text-neutral-400">
                  Browse available escrows and accept work to receive payment. Click on an escrow to see full details before accepting.
                </p>
                <p className="text-xs text-neutral-500 italic">
                  Some escrows may be restricted to specific wallets and won&apos;t appear here.
                </p>

                {directedToMe.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Directed to you
                      <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full">
                        {directedToMe.length}
                      </span>
                    </h3>
                    {directedToMe.map((e) => (
                      <EscrowCard
                        key={e.publicKey.toBase58()}
                        escrow={e}
                        onAction={fetchAll}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Open Escrows</h3>
                  {receivableEscrows.length === 0 && !loading ? (
                    <p className="text-neutral-500">
                      No open escrows available right now.
                    </p>
                  ) : (
                    receivableEscrows.map((e) => (
                      <EscrowCard
                        key={e.publicKey.toBase58()}
                        escrow={e}
                        onAction={fetchAll}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              {/* My Escrows */}
              <TabsContent value="escrows" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold">My Escrows</h2>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "all",
                        "Open",
                        "InProgress",
                        "Submitted",
                        "Completed",
                        "Cancelled",
                        "Disputed",
                      ] as const
                    ).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          statusFilter === s
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-neutral-400 border-neutral-700 hover:border-neutral-500"
                        }`}
                      >
                        {s === "all" ? "All" : s}
                      </button>
                    ))}
                  </div>
                </div>

                {myEscrows.length === 0 && !loading ? (
                  <p className="text-neutral-500">
                    {statusFilter === "all"
                      ? "No escrows found."
                      : `No ${statusFilter} escrows.`}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {myEscrows.map((e) => (
                      <div key={e.publicKey.toBase58()}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-neutral-500">
                            Role:{" "}
                            <span
                              className={
                                e.role === "Sender"
                                  ? "text-blue-400"
                                  : "text-green-400"
                              }
                            >
                              {e.role}
                            </span>
                          </span>
                        </div>
                        <EscrowCard escrow={e} onAction={fetchAll} />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  )
}
