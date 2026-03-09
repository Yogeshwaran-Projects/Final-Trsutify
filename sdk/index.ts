/**
 * Trustify SDK — Decentralized Payment Escrow Middleware
 *
 * Re-exports from the core blockchain interface with
 * middleware-friendly naming conventions.
 */

export {
  // Core escrow operations
  createEscrow,
  acceptEscrow,
  releaseFunds,
  cancelEscrow,
  raiseDispute,

  // Aliased as middleware-friendly names
  submitWork as confirmDelivery,
  fetchClientEscrows as fetchSenderEscrows,
  fetchFreelancerEscrows as fetchReceiverEscrows,

  // Original names also available
  submitWork,
  fetchClientEscrows,
  fetchFreelancerEscrows,

  // Fetch utilities
  fetchEscrow,
  fetchOpenEscrows,

  // Wallet utilities
  getWalletBalance,
  requestAirdrop,

  // Helpers
  getConnection,
  deriveEscrowPDA,
  getExplorerUrl,
  getAddressExplorerUrl,
  lamportsToSol,
  solToLamports,

  // Constants
  getProgramId,
  NETWORK,
  LAMPORTS_PER_SOL,

  // Types
  type EscrowAccount,
  type EscrowStatus,
  type TransactionResult,
} from "@/lib/solana"

export const TRUSTIFY_SDK_VERSION = "1.0.0"
