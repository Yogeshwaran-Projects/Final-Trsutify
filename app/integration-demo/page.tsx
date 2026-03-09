"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    image: "https://placehold.co/400x300/1a1a1a/666?text=Headphones",
    description: "Premium noise-cancelling wireless headphones",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 1.2,
    image: "https://placehold.co/400x300/1a1a1a/666?text=Keyboard",
    description: "Cherry MX switches, RGB backlit",
  },
  {
    id: 3,
    name: "USB-C Hub",
    price: 0.3,
    image: "https://placehold.co/400x300/1a1a1a/666?text=USB-C+Hub",
    description: "7-in-1 multiport adapter",
  },
  {
    id: 4,
    name: "Laptop Stand",
    price: 0.8,
    image: "https://placehold.co/400x300/1a1a1a/666?text=Laptop+Stand",
    description: "Adjustable aluminum laptop stand",
  },
]

export default function IntegrationDemoPage() {
  const [successProducts, setSuccessProducts] = useState<Set<number>>(new Set())

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Demo Banner */}
      <div className="bg-amber-500 text-black px-4 py-2 text-center text-sm font-medium">
        This is a demo of how any e-commerce site integrates Trustify escrow payments.{" "}
        <Link href="/" className="underline font-bold">
          Back to Trustify
        </Link>
      </div>

      {/* TechMart Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-neutral-900">TechMart</span>
                <p className="text-xs text-neutral-500">Demo E-Commerce Store</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Shield className="w-3 h-3 mr-1" />
                Powered by Trustify
              </Badge>
              <Link href="/">
                <Button variant="outline" size="sm" className="text-neutral-600">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Trustify
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-50 to-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            Shop with Escrow Protection
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Every purchase is secured by Trustify. Funds are held in a Solana smart contract
            until you confirm delivery. No risk for buyers or sellers.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8">Featured Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="bg-white border-neutral-200 overflow-hidden">
                <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                  <div className="text-4xl text-neutral-300">
                    {product.id === 1 && "🎧"}
                    {product.id === 2 && "⌨️"}
                    {product.id === 3 && "🔌"}
                    {product.id === 4 && "💻"}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-neutral-900 mb-1">{product.name}</h3>
                  <p className="text-sm text-neutral-500 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-neutral-900">{product.price} SOL</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                      <Lock className="w-3 h-3 mr-1" />
                      Escrow
                    </Badge>
                  </div>
                  {successProducts.has(product.id) ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm py-2">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How Integration Works */}
      <section className="py-16 bg-white border-y border-neutral-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
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
              },
              {
                step: "2",
                title: "Set Amount",
                desc: "Pass the payment amount and description as props",
                icon: Zap,
              },
              {
                step: "3",
                title: "User Pays",
                desc: "Buyer clicks the button and approves the wallet transaction",
                icon: ShoppingCart,
              },
              {
                step: "4",
                title: "Escrow Created",
                desc: "Funds are locked on-chain until delivery is confirmed",
                icon: Lock,
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-5 h-5 text-amber-700" />
                </div>
                <div className="text-xs font-mono text-amber-600 mb-2">Step {item.step}</div>
                <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Snippet */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
            Integration Code
          </h2>
          <p className="text-neutral-500 text-center mb-8">
            This is the actual code powering the buy buttons above
          </p>

          <div className="rounded-2xl border border-neutral-200 bg-[#0c0c0e] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
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
          console.log("Escrow created:", signature)
        }}
        onError={(error) => {
          console.error("Payment failed:", error)
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
      <footer className="bg-neutral-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-neutral-400">
                Powered by{" "}
                <Link href="/" className="text-white hover:text-amber-400 transition-colors">
                  Trustify
                </Link>
                {" "}— Decentralized Payment Escrow on Solana
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                  Trustify Home
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </Link>
              <Link href="/dashboard/sender">
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
