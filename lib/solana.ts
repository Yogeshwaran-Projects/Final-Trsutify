import { Connection, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { Program, AnchorProvider, BN, type Wallet as AnchorWallet } from "@project-serum/anchor"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import idl from "../idl/trustify.json"

// ============================================
// CONSTANTS
// ============================================

const PROGRAM_ID = new PublicKey(idl.metadata.address)
const NETWORK = "https://api.devnet.solana.com"
const ESCROW_SEED = "escrow"

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
  bump: number
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
  return new Program(idl as any, PROGRAM_ID, provider)
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
    PROGRAM_ID
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
  description: string
): Promise<TransactionResult> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  const amount = solToLamports(amountSol)

  // Generate unique escrow ID using timestamp
  const escrowId = new BN(Date.now())
  const [escrowPDA] = deriveEscrowPDA(wallet.publicKey, escrowId)

  const signature = await program.methods
    .createEscrow(amount, description, escrowId)
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
  escrowAddress: string
): Promise<TransactionResult> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)
  const escrowPubkey = new PublicKey(escrowAddress)

  const signature = await program.methods
    .submitWork()
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
    return {
      publicKey: escrowPubkey,
      client: account.client as PublicKey,
      freelancer: account.freelancer as PublicKey,
      amount: account.amount as BN,
      status: parseEscrowStatus(account.status),
      escrowId: account.escrowId as BN,
      createdAt: account.createdAt as BN,
      description: account.description as string,
      bump: account.bump as number,
    }
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

  const accounts = await program.account.escrow.all([
    {
      memcmp: {
        offset: 8, // After discriminator
        bytes: wallet.publicKey.toBase58(),
      },
    },
  ])

  return accounts.map((acc) => ({
    publicKey: acc.publicKey,
    client: acc.account.client as PublicKey,
    freelancer: acc.account.freelancer as PublicKey,
    amount: acc.account.amount as BN,
    status: parseEscrowStatus(acc.account.status),
    escrowId: acc.account.escrowId as BN,
    createdAt: acc.account.createdAt as BN,
    description: acc.account.description as string,
    bump: acc.account.bump as number,
  }))
}

/**
 * Fetch all escrows where user is freelancer
 */
export const fetchFreelancerEscrows = async (
  wallet: WalletContextState
): Promise<EscrowAccount[]> => {
  if (!wallet.publicKey) throw new Error("Wallet not connected")

  const program = getProgram(wallet)

  const accounts = await program.account.escrow.all([
    {
      memcmp: {
        offset: 8 + 32, // After discriminator + client pubkey
        bytes: wallet.publicKey.toBase58(),
      },
    },
  ])

  return accounts.map((acc) => ({
    publicKey: acc.publicKey,
    client: acc.account.client as PublicKey,
    freelancer: acc.account.freelancer as PublicKey,
    amount: acc.account.amount as BN,
    status: parseEscrowStatus(acc.account.status),
    escrowId: acc.account.escrowId as BN,
    createdAt: acc.account.createdAt as BN,
    description: acc.account.description as string,
    bump: acc.account.bump as number,
  }))
}

/**
 * Fetch all open escrows (for freelancers browsing available work)
 */
export const fetchOpenEscrows = async (
  wallet: WalletContextState
): Promise<EscrowAccount[]> => {
  const program = getProgram(wallet)

  // Fetch all escrows and filter client-side for "Open" status
  const accounts = await program.account.escrow.all()

  return accounts
    .map((acc) => ({
      publicKey: acc.publicKey,
      client: acc.account.client as PublicKey,
      freelancer: acc.account.freelancer as PublicKey,
      amount: acc.account.amount as BN,
      status: parseEscrowStatus(acc.account.status),
      createdAt: acc.account.createdAt as BN,
      description: acc.account.description as string,
      bump: acc.account.bump as number,
    }))
    .filter((escrow) => escrow.status === "Open")
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { PROGRAM_ID, NETWORK, LAMPORTS_PER_SOL }
