import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletContextProvider } from "@/components/wallet-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trustify - Blockchain-Powered Freelancing by ",
  description: "Secure contracts, escrow protection, milestone payments",
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
      </body>
    </html>
  )
}
