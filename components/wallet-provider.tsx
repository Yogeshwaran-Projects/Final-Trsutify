"use client"

import { type FC, type ReactNode, useMemo, useState, useEffect } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

interface Props {
  children: ReactNode
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  const endpoint = useMemo(() => "https://devnet.helius-rpc.com/?api-key=0d877281-6ed1-4d0c-94d0-aa2d396aee2e", [])

  // Empty array - wallet adapter will auto-detect Phantom via Standard Wallet interface
  const wallets = useMemo(() => [], [])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
