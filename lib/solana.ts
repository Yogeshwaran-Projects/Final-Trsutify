import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Program, AnchorProvider, BN, BorshAccountsCoder, type Wallet as AnchorWallet } from "@project-serum/anchor"
import bs58 from "bs58"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import idl from "../idl/trustify.json"
import { extractCid, fetchMetadata, type EscrowMetadata } from "./ipfs"

// ============================================
// CONSTANTS
// ============================================

let _programId: PublicKey | null = null
const getProgramId = () => {
  if (!_programId) _programId = new PublicKey(idl.metadata.address)
  return _programId
}
const NETWORK = "https://devnet.helius-rpc.com/?api-key=0d877281-6ed1-4d0c-94d0-aa2d396aee2e"
const ESCROW_SEED = "escrow"
let _defaultPubkey: PublicKey | null = null
const getDefaultPubkey = () => {
  if (!_defaultPubkey) _defaultPubkey = new PublicKey(new Uint8Array(32))
  return _defaultPubkey
}

// ============================================
// TYPES
// ============================================

export type EscrowStatus =
  | "Open"
  | "InProgress"
  | "Submitted"
  | "Completed"
  | "Cancelled"
  | "Disputed"

export interface EscrowAccount {
  publicKey: PublicKey
  client: PublicKey
  freelancer: PublicKey
  amount: BN
  status: EscrowStatus
  escrowId: BN
  createdAt: BN
  description: string
  submissionCid: string
  bump: number
  metadata?: EscrowMetadata
}

export interface TransactionResult {
  signature: string
  escrowAddress?: string
  explorerUrl: string
}

// ============================================
// PROVIDER SETUP
// ============================================

export const getConnection = (): Connection => {
  return new Connection(NETWORK, "confirmed")
}

const getProvider = (wallet: WalletContextState): AnchorProvider => {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error("Wallet not connected properly")
  }

  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  } as AnchorWallet

  const connection = getConnection()
  return new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "confirmed",
    commitment: "confirmed",
  })
}

const getProgram = (wallet: WalletContextState): Program => {
  const provider = getProvider(wallet)
  return new Program(idl as any, getProgramId(), provider)
}

// ============================================
// PDA DERIVATION
// ============================================

export const deriveEscrowPDA = (
  clientPubkey: PublicKey,
  escrowId: number | BN
): [PublicKey, number] => {
  const escrowIdBuffer = Buffer.alloc(8)
  const idValue = typeof escrowId === "number" ? BigInt(escrowId) : BigInt(escrowId.toString())
  escrowIdBuffer.writeBigUInt64LE(idValue)

  return PublicKey.findProgramAddressSync(
    [Buffer.from(ESCROW_SEED), clientPubkey.toBuffer(), escrowIdBuffer],
    getProgramId()
  )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getExplorerUrl = (signature: string): string => {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`
}

export const getAddressExplorerUrl = (address: string): string => {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`
}

export const lamportsToSol = (lamports: number | BN): number => {
  const value = typeof lamports === "number" ? lamports : lamports.toNumber()
  return value / LAMPORTS_PER_SOL
}

export const solToLamports = (sol: number): BN => {
  return new BN(sol * LAMPORTS_PER_SOL)
}

/**
 * Fetch escrows via raw getProgramAccounts + per-account decode.
 * Anchor's all() throws if ANY account has wrong layout, so we decode individually.
 */
const ESCROW_DISCRIMINATOR = bs58.encode(BorshAccountsCoder.accountDiscriminator("Escrow"))

const safeFetchAllEscrows = async (
  program: Program,
  filters?: { memcmp: { offset: number; bytes: string } }[]
): Promise<EscrowAccount[]> => {
  const connection = getConnection()
  const rpcFilters: any[] = [
    { memcmp: { offset: 0, bytes: ESCROW_DISCRIMINATOR } },
  ]
  if (filters) {
    for (const f of filters) rpcFilters.push({ memcmp: f.memcmp })
  }

  const rawAccounts = await connection.getProgramAccounts(getProgramId(), {
    filters: rpcFilters,
  })

  const results: EscrowAccount[] = []
  for (const { pubkey, account } of rawAccounts) {
    try {
      const decoded = program.coder.accounts.decode("Escrow", account.data)
      const mapped = safeMapEscrow(pubkey, decoded)
      if (mapped) results.push(mapped)
    } catch {
      // Old account — skip
    }
  }
  return results
}

const safeMapEscrow = (publicKey: PublicKey, account: any): EscrowAccount | null => {
  try {
    return {
      publicKey,
      client: account.client as PublicKey,
      freelancer: account.freelancer as PublicKey,
      amount: account.amount as BN,
      status: parseEscrowStatus(account.status),
      escrowId: account.escrowId as BN,
      createdAt: account.createdAt as BN,
      description: account.description as string,
      submissionCid: (account.submissionCid as string) || "",
      bump: account.bump as number,
    }
  } catch {
    return null
  }
}

const parseEscrowStatus = (status: any): EscrowStatus => {
  if (status.open) return "Open"
  if (status.inProgress) return "InProgress"
  if (status.submitted) return "Submitted"
  if (status.completed) return "Completed"
  if (status.cancelled) return "Cancelled"
  if (status.disputed) return "Disputed"
  return "Open"
}

// ============================================
// WALLET FUNCTIONS
// ============================================

export const getWalletBalance = async (wallet: WalletContextState): Promise<number> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const connection = getConnection()
  const balance = await connection.getBalance(wallet.publicKey)
  return lamportsToSol(balance)
}

export const requestAirdrop = async (wallet: WalletContextState, amount: number = 2): Promise<string> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const connection = getConnection()
  const signature = await connection.requestAirdrop(
    wallet.publicKey,
    amount * LAMPORTS_PER_SOL
  )

  // Wait for confirmation
  await connection.confirmTransaction(signature, "confirmed")

  return signature
}

// ============================================
// ESCROW FUNCTIONS
// ============================================

/**
 * Create a new escrow - Client deposits SOL into PDA vault
 */
export const createEscrow = async (
  wallet: WalletContextState,
  amountSol: number,
  description: string,
  receiver?: string
): Promise<TransactionResult> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  const amount = solToLamports(amountSol)
  const receiverPubkey = receiver ? new PublicKey(receiver) : getDefaultPubkey()

  // Generate unique escrow ID using timestamp
  const escrowId = new BN(Date.now())
  const [escrowPDA] = deriveEscrowPDA(wallet.publicKey, escrowId)

  const signature = await program.methods
    .createEscrow(amount, description, escrowId, receiverPubkey)
    .accounts({
      escrow: escrowPDA,
      client: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return {
    signature,
    escrowAddress: escrowPDA.toBase58(),
    explorerUrl: getExplorerUrl(signature),
  }
}

/**
 * Freelancer accepts the escrow task
 */
export const acceptEscrow = async (
  wallet: WalletContextState,
  escrowAddress: string
): Promise<TransactionResult> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  const escrowPubkey = new PublicKey(escrowAddress)

  const signature = await program.methods
    .acceptEscrow()
    .accounts({
      escrow: escrowPubkey,
      freelancer: wallet.publicKey,
    })
    .rpc()

  return {
    signature,
    explorerUrl: getExplorerUrl(signature),
  }
}

/**
 * Freelancer submits work for review
 */
export const submitWork = async (
  wallet: WalletContextState,
  escrowAddress: string,
  submissionCid: string
): Promise<TransactionResult> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")
  if (!submissionCid) throw new Error("Submission CID is required")

  const program = getProgram(wallet)
  const escrowPubkey = new PublicKey(escrowAddress)

  const signature = await program.methods
    .submitWork(submissionCid)
    .accounts({
      escrow: escrowPubkey,
      freelancer: wallet.publicKey,
    })
    .rpc()

  return {
    signature,
    explorerUrl: getExplorerUrl(signature),
  }
}

/**
 * Client releases funds to freelancer after work completion
 */
export const releaseFunds = async (
  wallet: WalletContextState,
  escrowAddress: string,
  freelancerAddress: string
): Promise<TransactionResult> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  const escrowPubkey = new PublicKey(escrowAddress)
  const freelancerPubkey = new PublicKey(freelancerAddress)

  const signature = await program.methods
    .releaseFunds()
    .accounts({
      escrow: escrowPubkey,
      client: wallet.publicKey,
      freelancer: freelancerPubkey,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return {
    signature,
    explorerUrl: getExplorerUrl(signature),
  }
}

/**
 * Client cancels escrow (only if not yet accepted)
 */
export const cancelEscrow = async (
  wallet: WalletContextState,
  escrowAddress: string
): Promise<TransactionResult> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  const escrowPubkey = new PublicKey(escrowAddress)

  const signature = await program.methods
    .cancelEscrow()
    .accounts({
      escrow: escrowPubkey,
      client: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc()

  return {
    signature,
    explorerUrl: getExplorerUrl(signature),
  }
}

/**
 * Raise a dispute (either party can raise)
 */
export const raiseDispute = async (
  wallet: WalletContextState,
  escrowAddress: string
): Promise<TransactionResult> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  const escrowPubkey = new PublicKey(escrowAddress)

  const signature = await program.methods
    .raiseDispute()
    .accounts({
      escrow: escrowPubkey,
      caller: wallet.publicKey,
    })
    .rpc()

  return {
    signature,
    explorerUrl: getExplorerUrl(signature),
  }
}

// ============================================
// FETCH FUNCTIONS
// ============================================

/**
 * Fetch a single escrow account by address
 */
export const fetchEscrow = async (
  wallet: WalletContextState,
  escrowAddress: string
): Promise<EscrowAccount | null> => {
  const program = getProgram(wallet)
  const escrowPubkey = new PublicKey(escrowAddress)

  try {
    const account = await program.account.escrow.fetch(escrowPubkey)
    return safeMapEscrow(escrowPubkey, account)
  } catch (e) {
    console.error("Error fetching escrow:", e)
    return null
  }
}

/**
 * Fetch all escrows for a client
 */
export const fetchClientEscrows = async (
  wallet: WalletContextState
): Promise<EscrowAccount[]> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  return safeFetchAllEscrows(program, [
    { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } },
  ])
}

/**
 * Fetch all escrows where user is freelancer
 */
export const fetchFreelancerEscrows = async (
  wallet: WalletContextState
): Promise<EscrowAccount[]> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  return safeFetchAllEscrows(program, [
    { memcmp: { offset: 8 + 32, bytes: wallet.publicKey.toBase58() } },
  ])
}

/**
 * Fetch all open escrows (for freelancers browsing available work)
 */
export const fetchOpenEscrows = async (
  wallet: WalletContextState
): Promise<EscrowAccount[]> => {
  const program = getProgram(wallet)
  const all = await safeFetchAllEscrows(program)
  return all.filter((escrow) => escrow.status === "Open")
}

// ============================================
// METADATA HELPERS
// ============================================

export async function resolveEscrowMetadata(
  escrows: EscrowAccount[]
): Promise<EscrowAccount[]> {
  const results = await Promise.all(
    escrows.map(async (e) => {
      const cid = extractCid(e.description)
      if (!cid) return e
      const metadata = await fetchMetadata(cid)
      return metadata ? { ...e, metadata } : e
    })
  )
  return results
}

export function getEscrowTitle(escrow: EscrowAccount): string {
  if (escrow.metadata?.title) return escrow.metadata.title
  const desc = escrow.description
  if (desc.startsWith("ipfs://")) return "Escrow"
  return desc.length > 50 ? desc.slice(0, 50) + "..." : desc
}

export function getEscrowDescription(escrow: EscrowAccount): string {
  if (escrow.metadata?.description) return escrow.metadata.description
  if (escrow.description.startsWith("ipfs://")) return ""
  return escrow.description
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { getProgramId, NETWORK, LAMPORTS_PER_SOL }
export type { EscrowMetadata }
