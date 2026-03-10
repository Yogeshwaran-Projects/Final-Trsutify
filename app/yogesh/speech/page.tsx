"use client"

import { useState } from "react"

// ============================================
// DATA
// ============================================

interface SpeechSection {
  id: string
  phase: string
  title: string
  duration: string
  content: string[]
  notes?: string[]
  transition?: string
}

const SPEECH: SpeechSection[] = [
  {
    id: "opening",
    phase: "Opening",
    title: "The Problem Statement",
    duration: "~2 min",
    content: [
      "Good [morning/afternoon], I'm Yogeshwaran, and today I'll present Trustify — a decentralized payment escrow protocol built on the Solana blockchain.",
      "Let me start with the problem. Imagine you're a freelancer in India, and a client in the US wants to hire you for a $200 project. Right now, your options are: PayPal — which charges 2.9% plus $0.30 per transaction, takes up to 3 business days to withdraw, and is unavailable in some countries. Or direct crypto transfer — where you send work first and hope the client sends payment. There's no protection for either party.",
      "The fundamental issue is TRUST. The client doesn't trust the freelancer to deliver quality work. The freelancer doesn't trust the client to pay after delivery. Traditional escrow services like Escrow.com charge 3-5% fees and take days to process. For a $50 microtask, paying $5 in fees is absurd.",
      "What if we could build a system where neither party needs to trust each other — where the code itself enforces the agreement? That's Trustify.",
    ],
    transition: "So how does Trustify solve this? Let me walk you through the architecture.",
  },
  {
    id: "overview",
    phase: "Architecture Overview",
    title: "The Big Picture — How It All Connects",
    duration: "~3 min",
    content: [
      "Trustify has three layers. First, the smart contract on Solana — this is the trustless core that holds funds and enforces state transitions. Second, IPFS for off-chain storage — where we store rich metadata like task descriptions, file attachments, and submission proofs. Third, the Next.js frontend — what users interact with.",
      "Here's the flow: A client creates an escrow by depositing SOL into a Program Derived Address — think of it as a vault that only our smart contract can open. The escrow description is stored on IPFS, and the IPFS content ID is stored on-chain. This gives us the best of both worlds: cheap rich data storage off-chain, with an immutable reference on-chain.",
      "A freelancer browses open escrows, accepts one, does the work, and submits proof — again stored on IPFS with the CID committed on-chain. The client reviews the submission. If satisfied, they release funds directly from the escrow PDA to the freelancer's wallet. The entire lifecycle costs about $0.45 in fees — compared to $3-20 on traditional platforms.",
      "Every action — creation, acceptance, submission, release, cancellation, dispute — is an on-chain instruction with cryptographic guarantees. No middleman can interfere, censor, or delay.",
    ],
    transition: "Let me dive deeper into the smart contract — the heart of the system.",
  },
  {
    id: "smart-contract",
    phase: "Smart Contract",
    title: "The On-Chain Program — How We Guard the Money",
    duration: "~4 min",
    content: [
      "The smart contract is written in Rust using the Anchor framework, deployed on Solana devnet. The program ID is GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R.",
      "The core data structure is the Escrow account. It stores: the client's public key, the freelancer's public key, the locked amount in lamports, the current status as an enum, the escrow ID, a creation timestamp, a description string containing the IPFS CID, a submission CID for proof of work, and the PDA bump seed. Total account size: 506 bytes.",
      "The escrow follows a strict state machine: Open → InProgress → Submitted → Completed. The client can cancel from Open state only. Either party can raise a dispute from InProgress or Submitted. Completed, Cancelled, and Disputed are terminal states.",
      "We use Program Derived Addresses for escrow vaults. The PDA is derived from three seeds: the constant string 'escrow', the client's public key, and the escrow ID as an 8-byte little-endian integer. The critical property of PDAs is that they are OFF the ed25519 elliptic curve — meaning no private key exists. Only our program can authorize operations on these accounts.",
      "Fund movement uses direct lamport manipulation. When the client releases funds, we directly subtract from the escrow account's lamports and add to the freelancer's. This works because our program OWNS the escrow account — the Solana runtime permits the owner to debit lamports. We don't use system_program::transfer for release because that only works for System Program-owned accounts.",
      "The program has 6 instructions and 10 custom error codes. Every instruction validates: correct status, correct signer, correct accounts. Anchor's derive macros generate these checks automatically from our constraint declarations.",
    ],
    notes: [
      "If asked about security: mention reentrancy protection (Solana's runtime prevents it), replay protection (recent blockhash), and account confusion protection (Anchor validates discriminators and PDA seeds).",
      "If asked about upgradability: the program authority can upgrade. For mainnet, we'd either revoke upgrade authority (immutable) or transfer to a multi-sig DAO.",
    ],
    transition: "Now, how does the off-chain storage work?",
  },
  {
    id: "ipfs-storage",
    phase: "Off-Chain Storage",
    title: "IPFS & Pinata — Where the Rich Data Lives",
    duration: "~2 min",
    content: [
      "Storing a 1KB JSON directly on Solana would cost about 0.003 SOL in rent. An IPFS CID reference is only 60 bytes. By storing metadata on IPFS and the CID on-chain, we get the same integrity guarantee at a fraction of the cost.",
      "IPFS is content-addressable: the address is a cryptographic hash of the content. Change one byte, the hash changes, the CID changes — it's a completely different address. This means a CID stored on-chain is an immutable commitment to specific data.",
      "We use Pinata as our IPFS pinning service. Files are uploaded through our Next.js API route — the server adds the Pinata JWT authorization and forwards to Pinata's pinning API. The CID is returned to the frontend, which then calls the on-chain instruction with 'ipfs://' plus the CID as the description.",
      "Our metadata schema is versioned — currently version 2. It includes: title, description, attached files with their own CIDs, optional deadline, receiver mode (open or directed), whitelist and blocklist of wallet addresses, required tech stack, and a requirements checklist. Submissions have their own schema with files, GitHub URL, checklist completion, and verification results.",
    ],
    transition: "Speaking of verification — let me show you our GitHub integration.",
  },
  {
    id: "github-verify",
    phase: "GitHub Verification",
    title: "Automated Code Verification",
    duration: "~2 min",
    content: [
      "When a freelancer submits work with a GitHub repository URL, we automatically verify the repository. Our API route parses the GitHub URL, then makes parallel API calls to fetch the repo's languages, file tree, and commit count.",
      "We check three things: First, does the repo contain actual source code? We scan the file tree for code files in standard directories like src/, lib/, app/, and programs/. This prevents someone from submitting an empty repo or one with only config files.",
      "Second, does the tech stack match? If the escrow requires React and Rust, we check the repository's languages. We maintain a TECH_ALIASES map — 'React' maps to JavaScript and TypeScript, 'Solana' maps to Rust, and so on.",
      "Third, commit history depth. A repo with 50 commits is more credible than one with a single commit that was just forked. We extract the total commit count from GitHub's pagination headers.",
      "The verification result is stored in the submission metadata on IPFS — creating a permanent record of the verification at the time of submission.",
    ],
    transition: "Let me walk through the frontend architecture.",
  },
  {
    id: "frontend",
    phase: "Frontend",
    title: "Next.js, Wallet Integration & User Experience",
    duration: "~3 min",
    content: [
      "The frontend is built with Next.js 15, React 19, TypeScript, and Tailwind CSS. We use Radix UI for accessible, unstyled primitives — dialogs, tabs, selects, checkboxes — that we style with our dark theme.",
      "Wallet integration uses Solana's wallet adapter libraries. The provider hierarchy is: ConnectionProvider wrapping WalletProvider wrapping WalletModalProvider. This gives every component access to the connected wallet's public key, signing functions, and connection to the RPC.",
      "When a user clicks any action button — say 'Accept Escrow' — here's what happens: Our code builds the instruction using Anchor's methods API. Anchor serializes the discriminator and arguments, constructs the transaction with a recent blockhash, and passes it to the wallet for signing. The user sees a popup in Phantom or Solflare asking to approve. Once approved, the signed transaction is sent to our Helius RPC endpoint, forwarded to the current leader validator, executed, and confirmed. Total time: about 2-3 seconds.",
      "For the dashboard, we fetch escrows using three parallel RPC calls with memcmp filters: my escrows as client (filter at byte offset 8), my escrows as freelancer (offset 40), and all open escrows. Each result is decoded, deduplicated, and enriched with IPFS metadata fetched in parallel with a 10-second timeout.",
      "We show real-time SOL prices from CoinGecko's free API, cached for 60 seconds. Both USD and INR values are displayed because our target users include Indian freelancers.",
    ],
    transition: "Let me highlight what makes this technically interesting.",
  },
  {
    id: "why-solana",
    phase: "Technical Decisions",
    title: "Why Solana? Why These Choices?",
    duration: "~2 min",
    content: [
      "Why Solana over Ethereum? Simple math. A complete escrow lifecycle — create, accept, submit, release — is 4 transactions. On Ethereum at current gas prices, that's $20 or more. On Solana, it's $0.001. That's a 20,000x difference. For micro-escrows of $50-100, Ethereum's fees are a non-starter.",
      "Solana's 400-millisecond block times and 12-second finality mean the user experience feels instant. On Ethereum, you'd wait 15+ minutes for finality.",
      "Why Anchor over raw Solana? Anchor gives us account validation macros, automatic discriminators, IDL generation for the frontend, and Borsh serialization. Writing raw Solana programs requires manual buffer parsing, manual account validation, and manual error handling. Anchor catches entire classes of bugs at compile time.",
      "Why IPFS over Arweave or just storing everything on-chain? On-chain storage is expensive. Arweave is permanent but costs per byte. IPFS with Pinata gives us effectively free storage for our metadata sizes, with the same integrity guarantee via content addressing. And if Pinata disappears, the CIDs work with any IPFS gateway.",
      "Why no state management library like Redux? Our state is page-scoped. The dashboard fetches escrows on mount and after each action. There's no cross-page state that needs global management. useState is sufficient, and it keeps the bundle small.",
    ],
    transition: "Let me address the limitations honestly.",
  },
  {
    id: "limitations",
    phase: "Limitations & Future",
    title: "What We Know Isn't Perfect Yet",
    duration: "~2 min",
    content: [
      "Dispute resolution is our biggest gap. When someone raises a dispute, we flag it on-chain, but there's no on-chain resolution mechanism. Human judgment is needed — 'did the freelancer really deliver what was asked?' is not a question code can answer. Future: DAO-based arbitration with staked reputation.",
      "Deadlines are informational only — stored in IPFS metadata, not enforced by the contract. A future version could use Solana's Clock sysvar for time-based auto-refund after deadline expiry.",
      "Whitelist and blocklist filtering happens on the frontend. A technically savvy user could bypass it by calling the program directly. Enforcing it on-chain would increase account size and cost.",
      "We only support native SOL. For price stability, users would want USDC escrows. Adding SPL token support requires associated token accounts and token program CPIs — architecturally straightforward but not yet implemented.",
      "Completed and cancelled escrows stay on-chain permanently because we don't have a close instruction. The rent (~0.003 SOL) is locked forever. Adding account closure would let us recover this.",
      "The project is on devnet. Mainnet deployment would require a professional security audit — firms like OtterSec or Neodyme specialize in Solana program audits.",
    ],
    transition: "To wrap up...",
  },
  {
    id: "closing",
    phase: "Closing",
    title: "Summary & Impact",
    duration: "~1 min",
    content: [
      "Trustify demonstrates that blockchain isn't just for speculation — it's infrastructure for real economic activity. A freelancer in any country can receive payment from a client in any other country, with mathematical guarantees of fairness, for less than a dollar in fees.",
      "The technical stack — Solana smart contract in Rust with Anchor, IPFS metadata with Pinata, Next.js frontend with wallet adapter — is production-grade. Every design decision has a clear 'why': PDAs for trustless custody, Borsh for deterministic serialization, memcmp for efficient querying, CIDs for integrity verification.",
      "The complete system has 6 on-chain instructions, 10 error codes, a versioned metadata schema, GitHub verification, real-time price feeds, and a responsive dark-themed UI. Total cost per escrow lifecycle: approximately $0.45. Total lines of Rust: about 400. Total lines of TypeScript: about 500 for the blockchain layer.",
      "Thank you. I'm happy to take questions — about the smart contract architecture, security model, PDA derivation, IPFS integration, or any other aspect of the system.",
    ],
  },
]

const QUICK_ANSWERS: { q: string; a: string }[] = [
  { q: "What is a PDA and why do you use it?", a: "A Program Derived Address is a deterministic address with no private key — it's off the ed25519 curve. Only our program can authorize operations on it. We use it as the escrow vault so that funds can only be moved by our program's logic, not by any individual." },
  { q: "How do you prevent the client from taking money back after the freelancer starts?", a: "The cancel instruction only works from Open status. Once a freelancer accepts and the status becomes InProgress, the cancel instruction fails with CannotCancelInProgress. The funds are committed." },
  { q: "What happens if Solana goes down?", a: "Funds are safe in the PDA. Solana has had outages historically, but account state is preserved across restarts. When the network recovers, all escrows resume their previous state." },
  { q: "How do you verify work quality?", a: "Multi-layered: on-chain CID proves what was submitted and when. GitHub verification checks for real code, matching tech stack, and commit depth. The client reviews before releasing. It's trust-assisted, not fully trust-free." },
  { q: "Why not Ethereum?", a: "Cost. Four transactions on Ethereum = $20+ in gas. On Solana = $0.001. For micro-escrows under $100, Ethereum fees make the product unusable." },
  { q: "Is the smart contract secure?", a: "We leverage Solana's runtime guarantees: no reentrancy, no unauthorized account access, replay protection via blockhash. Anchor validates all accounts before our logic runs. For mainnet, we'd get a professional audit." },
  { q: "What if IPFS data disappears?", a: "On-chain data — amount, status, addresses — is permanent and sufficient for the escrow to function. Metadata is pinned by Pinata. Even if Pinata goes down, any IPFS node with the content can serve it. The CID is the guarantee." },
  { q: "How do you handle disputes?", a: "Currently: flag on-chain as Disputed (terminal state), resolve off-chain. Future: DAO arbitration, time-locked resolution, or staked third-party arbitrators." },
  { q: "Can the program be upgraded maliciously?", a: "The deployer has upgrade authority. For mainnet, we'd either revoke it (making the program immutable) or transfer to a multi-sig DAO. On devnet, upgrade authority is retained for development." },
  { q: "What's the total cost for one complete escrow?", a: "About $0.45 — almost all of that is the account rent (~0.003 SOL). Transaction fees are negligible (~$0.003 total for 4 transactions). Compare with PayPal at 2.9% + $0.30." },
  { q: "Why Rust and not Solidity?", a: "Solana runs BPF bytecode, not EVM. Rust compiles to BPF. Beyond platform requirements, Rust provides memory safety, zero-cost abstractions, and catches entire categories of bugs at compile time." },
  { q: "What's the maximum escrow amount?", a: "u64 max in lamports = approximately 18.4 billion SOL. Far exceeds the total SOL supply. There's no practical limit." },
  { q: "How do you fetch escrows efficiently?", a: "Using getProgramAccounts with memcmp filters. We tell the RPC: 'give me all accounts owned by our program where bytes 8-39 match this public key.' The RPC does raw byte matching without deserializing — very fast." },
  { q: "What's the state machine?", a: "Six states: Open, InProgress, Submitted, Completed, Cancelled, Disputed. Transitions are enforced on-chain. You can't skip states or go backwards. Terminal states are Completed, Cancelled, and Disputed." },
  { q: "Why store the CID on-chain instead of the metadata?", a: "Cost and efficiency. A CID is ~60 bytes. Full metadata could be 1KB+. On-chain rent is ~0.00000348 SOL per byte. Plus, the CID IS the metadata's cryptographic fingerprint — same integrity guarantee." },
]

// ============================================
// COMPONENTS
// ============================================

function PhaseCard({ section, index }: { section: SpeechSection; index: number }) {
  const [expanded, setExpanded] = useState(true)

  const phaseColors: Record<string, string> = {
    "Opening": "border-blue-500 bg-blue-500/5",
    "Architecture Overview": "border-cyan-500 bg-cyan-500/5",
    "Smart Contract": "border-purple-500 bg-purple-500/5",
    "Off-Chain Storage": "border-green-500 bg-green-500/5",
    "GitHub Verification": "border-amber-500 bg-amber-500/5",
    "Frontend": "border-pink-500 bg-pink-500/5",
    "Technical Decisions": "border-orange-500 bg-orange-500/5",
    "Limitations & Future": "border-red-500 bg-red-500/5",
    "Closing": "border-emerald-500 bg-emerald-500/5",
  }

  const colorClass = phaseColors[section.phase] || "border-neutral-500 bg-neutral-500/5"

  return (
    <div id={section.id} className={`border-l-4 ${colorClass} rounded-r-lg overflow-hidden scroll-mt-24`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 text-sm font-bold shrink-0">
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">{section.phase}</span>
              <span className="text-xs text-neutral-600">{section.duration}</span>
            </div>
            <h3 className="text-lg font-semibold text-white mt-0.5">{section.title}</h3>
          </div>
        </div>
        <span className="text-neutral-500 text-xl">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4">
          {section.content.map((paragraph, i) => (
            <p key={i} className="text-neutral-300 leading-relaxed text-[15px]">
              {paragraph}
            </p>
          ))}

          {section.notes && section.notes.length > 0 && (
            <div className="mt-4 border border-amber-500/20 bg-amber-500/5 rounded-lg p-4">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-2">Prepared Answers</span>
              {section.notes.map((note, i) => (
                <p key={i} className="text-neutral-400 text-sm mt-1">
                  {note}
                </p>
              ))}
            </div>
          )}

          {section.transition && (
            <div className="mt-4 pt-3 border-t border-neutral-800">
              <p className="text-neutral-500 text-sm italic">
                Transition: &quot;{section.transition}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function ReviewSpeech() {
  const [showQA, setShowQA] = useState(false)

  const totalMinutes = SPEECH.reduce((acc, s) => {
    const match = s.duration.match(/(\d+)/)
    return acc + (match ? parseInt(match[1]) : 0)
  }, 0)

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white tracking-tight">Trustify &mdash; Review Presentation</h1>
          <span className="text-neutral-500 text-sm">~{totalMinutes} min total</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Overview card */}
        <div className="border border-neutral-800 rounded-lg p-6 mb-8 bg-neutral-900/50">
          <h2 className="text-xl font-bold text-white mb-3">Presentation Flow</h2>
          <p className="text-neutral-400 text-sm mb-4">
            This is your end-to-end speech for the final review. Each section is a natural phase of the presentation.
            Read it conversationally &mdash; these are talking points, not a script to memorize word-for-word.
          </p>
          <div className="flex flex-wrap gap-2">
            {SPEECH.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
              >
                {i + 1}. {s.phase}
              </a>
            ))}
          </div>
        </div>

        {/* Speech sections */}
        <div className="space-y-4">
          {SPEECH.map((section, i) => (
            <PhaseCard key={section.id} section={section} index={i} />
          ))}
        </div>

        {/* Quick-fire Q&A */}
        <div className="mt-12 border-t border-neutral-800 pt-8">
          <button
            onClick={() => setShowQA(!showQA)}
            className="flex items-center justify-between w-full text-left"
          >
            <div>
              <h2 className="text-xl font-bold text-white">Quick-Fire Q&A Prep</h2>
              <p className="text-neutral-500 text-sm mt-1">{QUICK_ANSWERS.length} common reviewer questions with concise answers</p>
            </div>
            <span className="text-neutral-500 text-xl">{showQA ? "−" : "+"}</span>
          </button>

          {showQA && (
            <div className="mt-6 space-y-3">
              {QUICK_ANSWERS.map(({ q, a }, i) => (
                <div key={i} className="border border-neutral-800 rounded-lg p-4">
                  <p className="text-white font-semibold text-sm mb-1.5">Q: {q}</p>
                  <p className="text-neutral-400 text-sm">{a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cheat sheet */}
        <div className="mt-12 border-t border-neutral-800 pt-8 mb-16">
          <h2 className="text-xl font-bold text-white mb-4">Key Numbers Cheat Sheet</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ["Program ID", "GwMcGo...z66R"],
              ["Instructions", "6"],
              ["Error codes", "10"],
              ["Account size", "506 bytes"],
              ["PDA seeds", "3 (escrow + client + id)"],
              ["Status states", "6"],
              ["Terminal states", "3"],
              ["Tx cost", "~$0.00025"],
              ["Total lifecycle", "~$0.45"],
              ["Block time", "400ms"],
              ["Finality", "~12 sec"],
              ["Escrow ID", "Date.now() (ms)"],
              ["IPFS timeout", "10 seconds"],
              ["Max file size", "10MB"],
              ["Max description", "200 chars"],
              ["SOL decimals", "9 (lamports)"],
              ["Commitment", "confirmed"],
              ["Client offset", "byte 8"],
              ["Freelancer offset", "byte 40"],
              ["Discriminator", "8 bytes (SHA-256)"],
            ].map(([label, value], i) => (
              <div key={i} className="border border-neutral-800 rounded-lg p-3 bg-neutral-900/50">
                <div className="text-neutral-500 text-xs">{label}</div>
                <div className="text-white font-mono text-sm mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-16">
          <p className="text-neutral-700 text-xs">
            Trustify Review Presentation Guide
          </p>
        </div>
      </main>
    </div>
  )
}
