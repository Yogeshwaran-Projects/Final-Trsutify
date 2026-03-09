"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchSolPrice } from "@/lib/currency"

export function useSolPrice() {
  const [usd, setUsd] = useState(0)
  const [inr, setInr] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const prices = await fetchSolPrice()
      setUsd(prices.usd)
      setInr(prices.inr)
    } catch {
      // keep previous values
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 60_000)
    return () => clearInterval(interval)
  }, [refresh])

  return { usd, inr, loading, refresh }
}
