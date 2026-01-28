"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, Wallet, ArrowRight, Play, CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const wallet = useWallet()

  useEffect(() => {
    if (wallet.connected) {
      router.push("/dashboard/client")
    }
  }, [wallet.connected, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Trustify</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-white/80">No sign up needed - just connect your wallet</p>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white">Wallet-Based Identity</CardTitle>
            <CardDescription className="text-white/60">
              Your Solana wallet is your account. No registration, no passwords.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No email required</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No password to remember</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Your keys, your identity</span>
              </div>
            </div>

            <div className="flex justify-center">
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-500 !to-blue-500 hover:!from-purple-600 hover:!to-blue-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link href="/dashboard/client">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Client
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard/freelancer">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Freelancer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <Link href="/demo">
                <Button variant="link" className="text-purple-400 hover:text-purple-300">
                  <Play className="w-4 h-4 mr-2" />
                  Try Demo First
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-white/60 hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
