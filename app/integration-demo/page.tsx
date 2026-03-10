"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const TrustifyButton = dynamic(
  () => import("@/sdk/TrustifyButton").then((m) => m.TrustifyButton),
  { ssr: false }
)
import {
  ShoppingCart,
  Shield,
  ArrowLeft,
  Code,
  ArrowRight,
  Zap,
  Lock,
  CheckCircle,
  ExternalLink,
} from "lucide-react"

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 0.5,
    emoji: "🎧",
    description: "Premium noise-cancelling wireless headphones",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 1.2,
    emoji: "⌨️",
    description: "Cherry MX switches, RGB backlit",
  },
  {
    id: 3,
    name: "USB-C Hub",
    price: 0.3,
    emoji: "🔌",
    description: "7-in-1 multiport adapter",
  },
  {
    id: 4,
    name: "Laptop Stand",
    price: 0.8,
    emoji: "💻",
    description: "Adjustable aluminum laptop stand",
  },
]

export default function IntegrationDemoPage() {
  const [successProducts, setSuccessProducts] = useState<Set<number>>(new Set())

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden">
      {/* Demo Banner */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/5 px-4 py-2 text-center text-sm font-medium text-neutral-300">
        This is a demo of how any e-commerce site integrates Trustify escrow payments.{" "}
        <Link href="/" className="underline font-bold text-white hover:text-neutral-200">
          Back to Trustify
        </Link>
      </div>

      {/* TechMart Header */}
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">TechMart</span>
                <p className="text-xs text-neutral-500">Demo E-Commerce Store</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30">
                <Shield className="w-3 h-3 mr-1" />
                Powered by Trustify
              </Badge>
              <Link href="/">
                <Button variant="outline" size="sm" className="border-white/10 text-neutral-400 hover:text-white hover:bg-white/5">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Trustify
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Shop with Escrow Protection
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Every purchase is secured by Trustify. Funds are held in a Solana smart contract
            until you confirm delivery. No risk for buyers or sellers.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-8">Featured Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-white/10 bg-neutral-900/50 overflow-hidden hover:border-white/20 transition-colors"
              >
                <div className="aspect-[4/3] bg-white/[0.03] flex items-center justify-center border-b border-white/5">
                  <div className="text-4xl">{product.emoji}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1">{product.name}</h3>
                  <p className="text-sm text-neutral-500 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">{product.price} SOL</span>
                    <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/10">
                      <Lock className="w-3 h-3 mr-1" />
                      Escrow
                    </Badge>
                  </div>
                  {successProducts.has(product.id) ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm py-2">
                      <CheckCircle className="w-4 h-4" />
                      Escrow created!
                    </div>
                  ) : (
                    <TrustifyButton
                      amount={product.price}
                      description={`TechMart: ${product.name}`}
                      label="Buy Now"
                      onSuccess={() => {
                        setSuccessProducts((prev) => new Set(prev).add(product.id))
                      }}
                      className="w-full justify-center"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Integration Works */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            How Integration Works
          </h2>
          <p className="text-neutral-500 text-center mb-12 max-w-xl mx-auto">
            Adding Trustify escrow to any site takes four steps
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Import Component",
                desc: "Add the TrustifyButton component to your project",
                icon: Code,
                color: "#3b82f6",
              },
              {
                step: "2",
                title: "Set Amount",
                desc: "Pass the payment amount and description as props",
                icon: Zap,
                color: "#f97316",
              },
              {
                step: "3",
                title: "User Pays",
                desc: "Buyer clicks the button and approves the wallet transaction",
                icon: ShoppingCart,
                color: "#a855f7",
              },
              {
                step: "4",
                title: "Escrow Created",
                desc: "Funds are locked on-chain until delivery is confirmed",
                icon: Lock,
                color: "#22c55e",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="text-xs font-mono mb-2" style={{ color: item.color }}>
                  Step {item.step}
                </div>
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Snippet */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">
            Integration Code
          </h2>
          <p className="text-neutral-500 text-center mb-8">
            This is the actual code powering the buy buttons above
          </p>

          <div className="rounded-2xl border border-white/10 bg-[#0c0c0e] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-neutral-500 ml-2">product-card.tsx</span>
            </div>
            <pre className="p-6 text-sm font-mono overflow-x-auto">
              <code className="text-neutral-300">{`import { TrustifyButton } from "@/sdk/TrustifyButton"

function ProductCard({ name, price }) {
  return (
    <div className="product-card">
      <h3>{name}</h3>
      <p>{price} SOL</p>

      <TrustifyButton
        amount={price}
        description={\`Purchase: \${name}\`}
        onSuccess={(signature) => {
          // Handle successful escrow creation
          // escrow created
        }}
      />
    </div>
  )
}`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-neutral-400">
                Powered by{" "}
                <Link href="/" className="text-white hover:text-purple-400 transition-colors">
                  Trustify
                </Link>
                {" "}&mdash; Decentralized Payment Escrow on Solana
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                  Trustify Home
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                  Dashboard
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
