import { Connection, PublicKey, SystemProgram } from "@solana/web3.js"
import { Program, AnchorProvider, web3, BN, type Wallet as AnchorWallet } from "@project-serum/anchor"
import type { WalletContextState } from "@solana/wallet-adapter-react"
import idl from "../idl/trustify.json"

const programID = new PublicKey(idl.metadata.address)
const network = "https://api.devnet.solana.com"

// 👇 Bypass 'payer' requirement for browser wallets (Phantom)
const getProvider = (wallet: WalletContextState): AnchorProvider => {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error("Wallet not connected properly")
  }

  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  } as AnchorWallet // ✅ Cast here

  const connection = new Connection(network, "processed")
  return new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: "processed",
  })
}

export const createTask = async (amount: number, wallet: WalletContextState) => {
  const provider = getProvider(wallet)
  const program = new Program(idl as any, programID, provider)
  const task = web3.Keypair.generate()
  const lamports = new BN(amount * web3.LAMPORTS_PER_SOL)

  await program.methods
    .createTask(lamports)
    .accounts({
      task: task.publicKey,
      client: wallet.publicKey,
      vault: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([task])
    .rpc()

  return task.publicKey.toBase58()
}

export const acceptTask = async (taskKey: string, wallet: WalletContextState) => {
  const provider = getProvider(wallet)
  const program = new Program(idl as any, programID, provider)

  await program.methods
    .acceptTask()
    .accounts({
      task: new PublicKey(taskKey),
      developer: wallet.publicKey,
    })
    .rpc()
}

export const releaseFunds = async (taskKey: string, wallet: WalletContextState) => {
  const provider = getProvider(wallet)
  const program = new Program(idl as any, programID, provider)

  await program.methods
    .releaseFunds()
    .accounts({
      task: new PublicKey(taskKey),
      developer: wallet.publicKey,
      vault: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}
