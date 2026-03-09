"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { SolAmount } from "@/components/SolAmount"
import { getWalletBalance, requestAirdrop } from "@/lib/solana"
import { RefreshCw, Loader2, Droplets } from "lucide-react"

interface DashboardHeaderProps {
  onRefresh?: () => void
}

export function DashboardHeader({ onRefresh }: DashboardHeaderProps) {
  const wallet = useWallet()
  const [mounted, setMounted] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [airdropping, setAirdropping] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const fetchBalance = useCallback(async () => {
    if (!wallet.publicKey) return
    try {
      const bal = await getWalletBalance(wallet)
      setBalance(bal)
    } catch {
      // ignore
    }
  }, [wallet])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchBalance()
    onRefresh?.()
    setRefreshing(false)
  }

  const handleAirdrop = async () => {
    setAirdropping(true)
    try {
      await requestAirdrop(wallet, 2)
      await fetchBalance()
    } catch {
      // ignore
    }
    setAirdropping(false)
  }

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-0.5"><Image src="/logo.png" alt="Trustify" width={28} height={28} className="w-full h-full object-contain rounded-md" /></div>
          <span className="font-semibold text-lg text-white">Trustify</span>
        </Link>

        <Link
          href="/architecture"
          className="ml-4 text-sm text-neutral-400 hover:text-white transition-colors hidden sm:inline"
        >
          Architecture
        </Link>

        {wallet.publicKey && balance !== null && (
          <div className="ml-4 text-sm">
            <SolAmount sol={balance} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {wallet.publicKey && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAirdrop}
              disabled={airdropping}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              {airdropping ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Droplets className="w-4 h-4 mr-1" />
              )}
              Airdrop
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-neutral-400 hover:text-white"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </>
        )}
        {mounted && (
          <WalletMultiButton
            style={{
              backgroundColor: "white",
              color: "black",
              height: "36px",
              fontSize: "14px",
              borderRadius: "8px",
            }}
          />
        )}
      </div>
    </header>
  )
}
