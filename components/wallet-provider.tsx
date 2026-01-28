"use client"

import { type FC, type ReactNode, useMemo, useState, useEffect } from "react"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { clusterApiUrl } from "@solana/web3.js"

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css"

interface Props {
  children: ReactNode
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

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
