let cachedPrice: { usd: number; inr: number; fetchedAt: number } | null = null
const CACHE_TTL = 60_000 // 60 seconds

export async function fetchSolPrice(): Promise<{ usd: number; inr: number }> {
  if (cachedPrice && Date.now() - cachedPrice.fetchedAt < CACHE_TTL) {
    return { usd: cachedPrice.usd, inr: cachedPrice.inr }
  }

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd,inr",
      { next: { revalidate: 60 } }
    )
    if (!res.ok) throw new Error("CoinGecko API error")
    const data = await res.json()
    cachedPrice = {
      usd: data.solana.usd,
      inr: data.solana.inr,
      fetchedAt: Date.now(),
    }
    return { usd: cachedPrice.usd, inr: cachedPrice.inr }
  } catch {
    // Return last cached value or fallback
    if (cachedPrice) return { usd: cachedPrice.usd, inr: cachedPrice.inr }
    return { usd: 0, inr: 0 }
  }
}

export function formatFiat(
  sol: number,
  price: number,
  currency: "usd" | "inr"
): string {
  const value = sol * price
  if (currency === "usd") {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
