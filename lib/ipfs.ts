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
  // v2 fields (optional for backwards compat)
  deadline?: string           // ISO date string, informational only
  receiverMode?: "open" | "directed"
  whitelist?: string[]        // wallet addresses allowed to accept
  blocklist?: string[]        // wallet addresses blocked from accepting
  techstack?: string[]        // e.g. ["React", "Node.js", "Rust"]
  requirements?: string[]     // checklist items the freelancer must satisfy
}

export interface SubmissionMetadata {
  version: number
  files: EscrowFileRef[]
  githubUrl?: string
  checklistCompleted?: boolean[]  // parallel array to escrow requirements
  verification?: {
    verified: boolean
    techstackMatch: string[]
    hasCode: boolean
    commitCount: number
    languages: Record<string, number>
  }
}

const GATEWAY =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "gateway.pinata.cloud")
    : (process.env.NEXT_PUBLIC_PINATA_GATEWAY ?? "gateway.pinata.cloud")

const metadataCache = new Map<string, EscrowMetadata>()
const submissionCache = new Map<string, SubmissionMetadata>()

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

export async function fetchSubmissionMetadata(
  cid: string
): Promise<SubmissionMetadata | null> {
  if (submissionCache.has(cid)) return submissionCache.get(cid)!

  try {
    const res = await fetch(`https://${GATEWAY}/ipfs/${cid}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.version && data.files) {
      submissionCache.set(cid, data as SubmissionMetadata)
      return data as SubmissionMetadata
    }
    return null
  } catch {
    return null
  }
}

export function getFileUrl(cid: string): string {
  return `https://${GATEWAY}/ipfs/${cid}`
}
