"use client"

import { useState, useEffect, useRef } from "react"
import type { EscrowAccount } from "@/lib/solana"
import { resolveEscrowMetadata } from "@/lib/solana"

export function useEscrowMetadata(escrows: EscrowAccount[]) {
  const [resolved, setResolved] = useState<EscrowAccount[]>(escrows)
  const [loading, setLoading] = useState(false)
  const prevKeys = useRef("")

  useEffect(() => {
    const keys = escrows.map((e) => e.publicKey.toBase58()).join(",")
    if (keys === prevKeys.current && resolved.length === escrows.length) return
    prevKeys.current = keys

    if (escrows.length === 0) {
      setResolved([])
      return
    }

    setLoading(true)
    resolveEscrowMetadata(escrows).then((r) => {
      setResolved(r)
      setLoading(false)
    })
  }, [escrows])

  return { escrows: resolved, loading }
}
