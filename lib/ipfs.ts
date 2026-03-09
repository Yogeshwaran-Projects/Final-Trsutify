export interface EscrowFileRef {
  name: string
  cid: string
  size: number
  mimeType: string
}

export interface EscrowMetadata {
  version: number
  title: string
  description: string
  files: EscrowFileRef[]
}

const GATEWAY =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "gateway.pinata.cloud")
    : (process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "gateway.pinata.cloud")

const metadataCache = new Map<string, EscrowMetadata>()

export function isIpfsCid(value: string): boolean {
  if (!value) return false
  const trimmed = value.startsWith("ipfs://") ? value.slice(7) : value
  // CIDv1 (bafy…) or CIDv0 (Qm…)
  return /^(bafy[a-z0-9]{50,}|Qm[a-zA-Z0-9]{44})$/.test(trimmed)
}

export function extractCid(description: string): string | null {
  if (description.startsWith("ipfs://")) {
    const cid = description.slice(7).trim()
    return isIpfsCid(cid) ? cid : null
  }
  return null
}

export async function fetchMetadata(
  cid: string
): Promise<EscrowMetadata | null> {
  if (metadataCache.has(cid)) return metadataCache.get(cid)!

  try {
    const res = await fetch(`https://${GATEWAY}/ipfs/${cid}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.version && data.title) {
      metadataCache.set(cid, data as EscrowMetadata)
      return data as EscrowMetadata
    }
    return null
  } catch {
    return null
  }
}

export function getFileUrl(cid: string): string {
  return `https://${GATEWAY}/ipfs/${cid}`
}
