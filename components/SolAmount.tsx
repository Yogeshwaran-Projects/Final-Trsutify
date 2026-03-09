"use client"

import { useSolPrice } from "@/hooks/useSolPrice"
import { formatFiat } from "@/lib/currency"

interface SolAmountProps {
  sol: number
  className?: string
  showFiat?: boolean
}

export function SolAmount({ sol, className, showFiat = true }: SolAmountProps) {
  const { usd, inr, loading } = useSolPrice()

  return (
    <span className={className}>
      <span className="font-semibold">{sol.toFixed(sol < 0.01 ? 4 : 2)} SOL</span>
      {showFiat && !loading && usd > 0 && (
        <span className="text-neutral-400 ml-1">
          (~{formatFiat(sol, usd, "usd")} / {formatFiat(sol, inr, "inr")})
        </span>
      )}
    </span>
  )
}
