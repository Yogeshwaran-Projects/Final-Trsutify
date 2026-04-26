import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletContextProvider } from "@/components/wallet-provider"
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trustify - Decentralized Payment Escrow Middleware on Solana",
  description: "Universal payment escrow protocol. Secure any transaction with Solana smart contracts.",
    generator: 'Yogeshwaran'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>{children}</WalletContextProvider>
        <Analytics />
      </body>
    </html>
  )
}
