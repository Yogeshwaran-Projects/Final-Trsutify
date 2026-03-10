"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// ============================================
// TYPES & DATA
// ============================================

interface TocItem {
  id: string
  title: string
  part: string
  partIndex: number
}

const PARTS = [
  "I: Foundations",
  "II: The Smart Contract",
  "III: Off-Chain Storage",
  "IV: Frontend Deep Dive",
  "V: Advanced Topics",
  "VI: Comparisons & Context",
  "VII: Reference",
  "VIII: The Kid-Friendly Guide",
]

const TOC: TocItem[] = [
  { id: "s1", title: "What is a Blockchain?", part: PARTS[0], partIndex: 0 },
  { id: "s2", title: "Cryptography", part: PARTS[0], partIndex: 0 },
  { id: "s3", title: "What is Solana?", part: PARTS[0], partIndex: 0 },
  { id: "s4", title: "Solana vs Ethereum vs Bitcoin", part: PARTS[0], partIndex: 0 },
  { id: "s5", title: "RPC & Helius", part: PARTS[0], partIndex: 0 },
  { id: "s6", title: "Anchor Framework", part: PARTS[1], partIndex: 1 },
  { id: "s7", title: "Program Derived Addresses", part: PARTS[1], partIndex: 1 },
  { id: "s8", title: "Escrow Account Anatomy", part: PARTS[1], partIndex: 1 },
  { id: "s9", title: "The State Machine", part: PARTS[1], partIndex: 1 },
  { id: "s10", title: "All 6 Instructions", part: PARTS[1], partIndex: 1 },
  { id: "s11", title: "Security Analysis", part: PARTS[1], partIndex: 1 },
  { id: "s12", title: "IPFS Deep Dive", part: PARTS[2], partIndex: 2 },
  { id: "s13", title: "Why Pinata", part: PARTS[2], partIndex: 2 },
  { id: "s14", title: "The Upload Pipeline", part: PARTS[2], partIndex: 2 },
  { id: "s15", title: "Metadata Schema", part: PARTS[2], partIndex: 2 },
  { id: "s16", title: "Next.js & React Architecture", part: PARTS[3], partIndex: 3 },
  { id: "s17", title: "Wallet Integration", part: PARTS[3], partIndex: 3 },
  { id: "s18", title: "CoinGecko Price Integration", part: PARTS[3], partIndex: 3 },
  { id: "s19", title: "GitHub Verification", part: PARTS[3], partIndex: 3 },
  { id: "s20", title: "Dashboard Data Flow", part: PARTS[3], partIndex: 3 },
  { id: "s21", title: "Transaction Lifecycle", part: PARTS[4], partIndex: 4 },
  { id: "s22", title: "Cost Analysis", part: PARTS[4], partIndex: 4 },
  { id: "s23", title: "Known Limitations", part: PARTS[4], partIndex: 4 },
  { id: "s24", title: "Mental Models", part: PARTS[4], partIndex: 4 },
  { id: "s25", title: "Reviewer Q&A", part: PARTS[4], partIndex: 4 },
  { id: "s26", title: "Trustify vs Everything", part: PARTS[5], partIndex: 5 },
  { id: "s27", title: "The Full Tech Stack", part: PARTS[5], partIndex: 5 },
  { id: "s28", title: "Environment Variables", part: PARTS[5], partIndex: 5 },
  { id: "s29", title: "Edge Cases & Errors", part: PARTS[6], partIndex: 6 },
  { id: "s30", title: "Glossary", part: PARTS[6], partIndex: 6 },
  { id: "s31", title: "How Trustify Works", part: PARTS[7], partIndex: 7 },
  { id: "s32", title: "The Magic Fingerprint (SHA-256)", part: PARTS[7], partIndex: 7 },
  { id: "s33", title: "The Unstoppable Clock (Proof of History)", part: PARTS[7], partIndex: 7 },
  { id: "s34", title: "The Magical Locker (PDA)", part: PARTS[7], partIndex: 7 },
  { id: "s35", title: "The Avalanche Effect", part: PARTS[7], partIndex: 7 },
  { id: "s36", title: "Keys & Signatures (ed25519)", part: PARTS[7], partIndex: 7 },
  { id: "s37", title: "The File Fingerprint (IPFS & CIDs)", part: PARTS[7], partIndex: 7 },
  { id: "s38", title: "The Board Game (State Machine)", part: PARTS[7], partIndex: 7 },
  { id: "s39", title: "Why Solana is So Fast", part: PARTS[7], partIndex: 7 },
  { id: "s40", title: "The Complete Story", part: PARTS[7], partIndex: 7 },
]

// ============================================
// REUSABLE COMPONENTS
// ============================================

function SectionBadge({ num }: { num: number }) {
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold mr-3 shrink-0">
      {num}
    </span>
  )
}

function PartHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pt-16 pb-8 border-t border-neutral-800 first:border-t-0 first:pt-0">
      <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
      <p className="text-neutral-500 italic mt-2">{subtitle}</p>
    </div>
  )
}

function Section({ id, num, title, children }: { id: string; num: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-12 scroll-mt-24">
      <div className="flex items-center mb-6">
        <SectionBadge num={num} />
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-6 text-neutral-300 leading-relaxed">{children}</div>
    </section>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return <h4 className="text-lg font-semibold text-white mt-8 mb-3">{children}</h4>
}

function WhyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-purple-500 bg-purple-500/5 p-4 rounded-r-lg text-sm my-4">
      <span className="text-purple-400 font-semibold text-xs uppercase tracking-wider block mb-1">Why This Matters</span>
      {children}
    </div>
  )
}

function EdgeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-amber-500 bg-amber-500/5 p-4 rounded-r-lg text-sm my-4">
      <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider block mb-1">Edge Case</span>
      {children}
    </div>
  )
}

function AttackBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-red-500 bg-red-500/5 p-4 rounded-r-lg text-sm my-4">
      <span className="text-red-400 font-semibold text-xs uppercase tracking-wider block mb-1">Attack Vector</span>
      {children}
    </div>
  )
}

function InsightBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-green-500 bg-green-500/5 p-4 rounded-r-lg text-sm my-4">
      <span className="text-green-400 font-semibold text-xs uppercase tracking-wider block mb-1">Key Insight</span>
      {children}
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 overflow-x-auto font-mono text-sm text-green-400 my-4 whitespace-pre">
      {children}
    </pre>
  )
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return <code className="text-green-400 bg-neutral-900 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
}

function Diagram({ children }: { children: string }) {
  return (
    <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 overflow-x-auto font-mono text-sm text-cyan-400 my-4 whitespace-pre leading-relaxed">
      {children}
    </pre>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="border border-neutral-800 bg-neutral-900 px-3 py-2 text-left text-neutral-200 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-neutral-800 px-3 py-2 text-neutral-400">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function TrustifyBible() {
  const [activeSection, setActiveSection] = useState("s1")
  const [tocOpen, setTocOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const handleTocClick = useCallback((id: string) => {
    setTocOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    const sections = TOC.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[]

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            break
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    )

    sections.forEach((s) => observerRef.current?.observe(s))
    return () => observerRef.current?.disconnect()
  }, [])

  // Group TOC by part
  let currentPart = -1

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white tracking-tight">Trustify &mdash; The Complete Bible</h1>
          <button
            onClick={() => setTocOpen(!tocOpen)}
            className="lg:hidden text-neutral-400 hover:text-white text-sm border border-neutral-700 px-3 py-1.5 rounded-lg"
          >
            {tocOpen ? "Close" : "Contents"}
          </button>
        </div>
      </header>

      {/* Mobile TOC Dropdown */}
      {tocOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] z-40 bg-[#09090b] border-b border-neutral-800 max-h-[70vh] overflow-y-auto p-4">
          <nav className="space-y-1">
            {TOC.map((item, idx) => {
              const showPart = item.partIndex !== (idx > 0 ? TOC[idx - 1].partIndex : -1)
              return (
                <div key={item.id}>
                  {showPart && (
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider pt-3 pb-1">
                      Part {item.part}
                    </div>
                  )}
                  <button
                    onClick={() => handleTocClick(item.id)}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded ${
                      activeSection === item.id ? "text-white bg-neutral-800" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {idx + 1}. {item.title}
                  </button>
                </div>
              )
            })}
          </nav>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex">
        {/* Desktop Sidebar TOC */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto border-r border-neutral-800 p-4">
          <nav className="space-y-0.5">
            {TOC.map((item, idx) => {
              const showPart = item.partIndex !== currentPart
              if (showPart) currentPart = item.partIndex
              return (
                <div key={item.id}>
                  {showPart && (
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider pt-4 pb-1">
                      Part {item.part}
                    </div>
                  )}
                  <button
                    onClick={() => handleTocClick(item.id)}
                    className={`block w-full text-left text-sm px-3 py-1.5 rounded transition-colors ${
                      activeSection === item.id
                        ? "text-white bg-neutral-800 font-medium"
                        : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                    }`}
                  >
                    {idx + 1}. {item.title}
                  </button>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl px-4 sm:px-8 pb-32">

          {/* ==================== PART I ==================== */}
          <PartHeader title="Part I: Foundations" subtitle="Before you understand our product, understand the ground it stands on" />

          {/* Section 1 */}
          <Section id="s1" num={1} title="What is a Blockchain? (The Real Story)">
            <p>
              Imagine a magic notebook. When you write in it, every person in the world gets an exact copy, instantly. Nobody can erase or change what&apos;s written. If someone tries to lie about what&apos;s in the notebook, everyone else&apos;s copy proves them wrong. That is a blockchain.
            </p>

            <Sub>How Blocks Work</Sub>
            <p>
              A block is a batch of transactions bundled together with a timestamp and the hash of the previous block. This &quot;hash chain&quot; is what gives blockchain its name. Change one block and you break every block after it &mdash; an avalanche effect that makes tampering computationally impossible.
            </p>
            <Diagram>{`Block N-1                   Block N                     Block N+1
+------------------+       +------------------+       +------------------+
| Hash: 0x8a3f...  |       | Hash: 0xc7d2...  |       | Hash: 0x1f9e...  |
| Prev: 0x3b1c...  |<------| Prev: 0x8a3f...  |<------| Prev: 0xc7d2...  |
| Time: 1700000000 |       | Time: 1700000400 |       | Time: 1700000800 |
| Txns: [...]      |       | Txns: [...]      |       | Txns: [...]      |
+------------------+       +------------------+       +------------------+

Change one byte in Block N -> its hash changes -> Block N+1's "Prev" no longer
matches -> Block N+2's "Prev" no longer matches -> entire chain breaks`}</Diagram>

            <Sub>SHA-256 Hash Function</Sub>
            <p>
              SHA-256 takes any input and produces a fixed 256-bit (32-byte) output. Change one letter and the output is completely different. It&apos;s a one-way function: you can&apos;t reverse the hash to find the input. And it&apos;s collision-resistant: finding two different inputs that produce the same hash is practically impossible (2^128 operations needed).
            </p>
            <Code>{`Input: "Hello"     -> 185f8db32271fe25f561a6fc938b2e26...
Input: "Hello!"    -> 334d016f755cd6dc58c53a86e183882f...
Input: "hello"     -> 2cf24dba5fb0a30e26e83b2ac5b9e29e...

One character changes EVERYTHING. This is the avalanche effect.`}</Code>

            <Sub>Merkle Trees</Sub>
            <p>
              Transactions inside a block are organized into a Merkle tree &mdash; a binary tree of hashes. You hash pairs of transactions, then hash those hashes together, until you get a single root hash. This allows you to prove a transaction exists in a block without downloading every transaction &mdash; you just need the &quot;proof path&quot; of sibling hashes up to the root.
            </p>
            <Diagram>{`                    Merkle Root
                   H(H_AB + H_CD)
                  /              \\
              H_AB                H_CD
            H(A+B)              H(C+D)
            /    \\              /    \\
          H(A)  H(B)          H(C)  H(D)
           |      |            |      |
          Tx A   Tx B        Tx C   Tx D

To prove Tx B exists: provide H(A), H_CD, and the root.
Verifier computes: H(B), then H(H(A)+H(B))=H_AB, then H(H_AB+H_CD) = Root. Match!`}</Diagram>

            <Sub>Consensus</Sub>
            <p>
              Thousands of computers must agree on one version of truth. Different approaches exist:
            </p>
            <Table
              headers={["Mechanism", "How It Works", "Used By"]}
              rows={[
                ["Proof of Work (PoW)", "Race to solve a math puzzle. Winner adds the block. Energy-intensive.", "Bitcoin"],
                ["Proof of Stake (PoS)", "Validators lock up tokens as collateral. Selected proportionally to stake.", "Ethereum"],
                ["Proof of History + PoS", "A SHA-256 hash chain creates a verifiable clock. PoS for validator selection.", "Solana"],
              ]}
            />

            <WhyBox>
              <p className="text-neutral-300">
                This matters for payments because there is no bank, no PayPal, no middleman. Two people can exchange value with mathematical certainty. The code IS the law. In Trustify, this means your escrow is governed by an immutable program on Solana, not by any company&apos;s terms of service.
              </p>
            </WhyBox>
          </Section>

          {/* Section 2 */}
          <Section id="s2" num={2} title="Cryptography &mdash; The Math That Makes It All Work">
            <p>
              You have a special lock (public key) anyone can use to lock a box for you. But only YOUR secret key can open it. You can also use your secret key to put a special stamp (signature) that proves YOU sealed the box &mdash; anyone can check the stamp with your public lock.
            </p>

            <Sub>Elliptic Curve Cryptography (ed25519)</Sub>
            <p>
              Solana uses the Edwards-curve Digital Signature Algorithm (EdDSA) with the ed25519 curve. The curve equation is:
            </p>
            <Code>{`-x² + y² = 1 + dx²y²     (over a finite field of size 2²⁵⁵ - 19)`}</Code>
            <p>Why ed25519 specifically?</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Faster than ECDSA (used by Ethereum) &mdash; ~70,000 verifications/sec on a single core</li>
              <li>Constant-time implementation &mdash; no timing side-channel attacks</li>
              <li>No special random number needed for signing (deterministic nonce from private key + message)</li>
              <li>32-byte public keys, 64-byte signatures &mdash; compact</li>
            </ul>

            <Sub>Key Generation</Sub>
            <Code>{`1. Generate random 32 bytes (the "seed")
2. SHA-512(seed) -> 64 bytes
3. Take first 32 bytes, clamp certain bits:
   - Clear lowest 3 bits (ensure divisible by 8)
   - Clear highest bit, set second-highest bit
   -> This is your scalar "a"
4. Multiply: A = a * G  (G is the base point on the curve)
   -> A is your public key (32 bytes, compressed)

Private key: the 32-byte seed
Public key: the 32-byte compressed point A`}</Code>

            <Sub>Signing & Verification</Sub>
            <Code>{`Signing:
  r = SHA-512(second_half_of_expanded_key + message)  (mod L)
  R = r * G
  S = r + SHA-512(R + A + message) * a                (mod L)
  Signature = (R, S)  -> 64 bytes

Verification:
  Check: S * G == R + SHA-512(R + A + message) * A
  If true -> valid signature. If false -> reject.`}</Code>

            <Sub>Base58 Encoding</Sub>
            <p>
              Solana addresses look like <InlineCode>GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R</InlineCode> because of Base58 encoding. Base58 = Base64 minus the confusing characters: <InlineCode>0, O, l, I, +, /</InlineCode>. This prevents copy-paste errors. A 32-byte public key becomes a 43-44 character human-readable, URL-safe string.
            </p>

            <InsightBox>
              <p className="text-neutral-300">
                Every escrow action in Trustify requires a digital signature. When you click &quot;Accept Escrow&quot;, your wallet signs a message with your private key. The Solana runtime verifies this signature BEFORE executing any instruction. No valid signature = no action. Period. The math is the guard.
              </p>
            </InsightBox>
          </Section>

          {/* Section 3 */}
          <Section id="s3" num={3} title="What is Solana? (Deep Technical)">
            <Sub>The Core Innovation: Proof of History</Sub>
            <p>
              In distributed systems, agreeing on TIME is hard. Bitcoin wastes energy on Proof of Work partly to establish time ordering. Solana solves this with a SHA-256 hash chain running continuously:
            </p>
            <Code>{`hash_1 = SHA-256(initial_value)
hash_2 = SHA-256(hash_1)
hash_3 = SHA-256(hash_2)
...
hash_N = SHA-256(hash_N-1)

Each hash MUST come after the previous. Can't skip ahead.
This creates a verifiable, unforgeable passage of time.

Transactions are slotted into this timeline:
hash_400000 -> Tx_A inserted -> hash_400001 -> hash_400002 -> Tx_B inserted -> ...

Anyone can verify: Tx_A came before Tx_B because it's earlier in the hash chain.`}</Code>
            <WhyBox>
              <p className="text-neutral-300">
                Validators don&apos;t need to talk to each other to agree on transaction ordering. They just slot transactions into the PoH timeline. This massively reduces communication overhead and enables 400ms block times and ~65,000 TPS.
              </p>
            </WhyBox>

            <Sub>Architecture Components</Sub>
            <Table
              headers={["Component", "What It Does", "Why It Matters"]}
              rows={[
                ["Leader Schedule", "Pre-determined which validator produces each block", "No competition, no wasted work"],
                ["Gulf Stream", "Transactions forwarded to next leader BEFORE needed", "Reduces confirmation latency"],
                ["Sealevel", "Parallel transaction execution across CPU cores", "Non-conflicting txs run simultaneously = speed"],
                ["Turbine", "Block propagation via packet splitting (like BitTorrent)", "Efficient data distribution to all validators"],
                ["Cloudbreak", "Horizontally-scaled account database", "Memory-mapped files for fast random access"],
              ]}
            />

            <Sub>Accounts Model</Sub>
            <p>
              Solana uses an account-based model (like Ethereum), not UTXO (like Bitcoin). Each address has a balance and can store arbitrary data. This is critical for escrow: we store complex state (client, freelancer, amount, status, description, etc.) directly in a single account. With UTXO, we&apos;d need complex script handling.
            </p>

            <Sub>Lamports</Sub>
            <p>
              Named after Leslie Lamport (computer scientist). <InlineCode>1 SOL = 1,000,000,000 lamports</InlineCode>. We always work in lamports on-chain because integer math has no floating-point precision errors. <InlineCode>0.1 + 0.2 !== 0.3</InlineCode> in JavaScript, but <InlineCode>100_000_000 + 200_000_000 === 300_000_000</InlineCode> in lamports.
            </p>

            <Sub>Rent</Sub>
            <p>
              Storing data on Solana costs ongoing &quot;rent&quot;. If an account&apos;s lamports drop below the rent-exempt threshold, it gets deleted by the runtime. Being rent-exempt means storing enough lamports upfront (~0.00089 SOL per 100 bytes). Anchor&apos;s <InlineCode>init</InlineCode> constraint automatically calculates and requires this.
            </p>

            <Sub>Transaction Anatomy</Sub>
            <Code>{`Transaction {
  signatures: [Signature, ...]     // 64 bytes each
  message: {
    recent_blockhash: Hash,        // 32 bytes, prevents replay (~90s validity)
    account_keys: [Pubkey, ...],   // All accounts involved
    instructions: [{
      program_id_index: u8,        // Which program to call
      accounts: [u8, ...],         // Indices into account_keys
      data: [u8, ...]              // Serialized instruction data
    }, ...]
  }
}

Max size: 1232 bytes
Max compute: 200,000 CU (default), 1,400,000 CU (max with request)
Our escrow txs: typically 50-80k compute units`}</Code>
          </Section>

          {/* Section 4 */}
          <Section id="s4" num={4} title="Solana vs Ethereum vs Bitcoin &mdash; Why Solana Won for Trustify">
            <Table
              headers={["Feature", "Bitcoin", "Ethereum", "Solana"]}
              rows={[
                ["Block time", "10 minutes", "12 seconds", "400ms"],
                ["Transactions/sec", "~7", "~30", "~65,000"],
                ["Transaction cost", "$1-50", "$2-50", "$0.00025"],
                ["Smart contracts", "Limited (Script)", "Yes (EVM/Solidity)", "Yes (BPF/Rust)"],
                ["Finality", "~60 min (6 blocks)", "~15 min (64 slots)", "~12 sec (32 slots)"],
                ["State model", "UTXO", "Account", "Account"],
                ["Programming", "Script", "Solidity/Vyper", "Rust/C"],
                ["Parallel execution", "No", "No", "YES (Sealevel)"],
                ["Data storage cost", "Expensive", "Very expensive", "Cheap (rent model)"],
              ]}
            />

            <WhyBox>
              <p className="text-neutral-300">
                A single escrow creation on Ethereum costs $5-50 in gas fees. On Solana it costs $0.00025. For a freelance payment of $50, paying $10 in fees is absurd. Solana makes micro-escrows viable.
              </p>
            </WhyBox>

            <Sub>The Cost Math</Sub>
            <p>
              A complete escrow lifecycle = 4 transactions (create + accept + submit + release):
            </p>
            <Table
              headers={["", "Ethereum (@ $5/tx)", "Solana (@ $0.00025/tx)"]}
              rows={[
                ["4 transactions", "$20.00", "$0.001"],
                ["Ratio", "1x", "20,000x cheaper"],
              ]}
            />
            <p>
              Why not Bitcoin? No smart contract capability &mdash; can&apos;t implement an escrow state machine. Lightning Network is too complex and limited for our use case. Why not Polygon/Arbitrum (L2s)? They still inherit Ethereum&apos;s complexity, have bridge risks, and Solana is L1 with L2-level performance.
            </p>
          </Section>

          {/* Section 5 */}
          <Section id="s5" num={5} title="RPC & Helius &mdash; The Communication Layer">
            <p>
              The blockchain is like a huge library. You can&apos;t walk in yourself &mdash; you need to call a librarian (RPC node) and ask them to look things up or add entries for you.
            </p>

            <Sub>JSON-RPC Protocol</Sub>
            <Code>{`Request:  POST /
{
  "jsonrpc": "2.0",
  "method": "getBalance",
  "params": ["GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R"],
  "id": 1
}

Response:
{
  "jsonrpc": "2.0",
  "result": { "value": 1000000000 },
  "id": 1
}

It's just HTTP POST with JSON. Simple, universal, language-agnostic.`}</Code>

            <Sub>Methods We Use</Sub>
            <Table
              headers={["Method", "What It Does", "Where We Use It"]}
              rows={[
                ["sendTransaction", "Submit signed tx to mempool", "Every escrow action (create, accept, submit, release, cancel, dispute)"],
                ["getProgramAccounts", "Get ALL accounts owned by a program with filters", "fetchClientEscrows, fetchFreelancerEscrows, fetchOpenEscrows"],
                ["getBalance", "Check wallet SOL balance", "Dashboard balance display"],
                ["getAccountInfo", "Fetch single account data", "fetchEscrow() for a single escrow"],
                ["confirmTransaction", "Wait for tx confirmation", "After every action, before refresh"],
              ]}
            />

            <Sub>Commitment Levels</Sub>
            <Table
              headers={["Level", "Meaning", "Speed", "Revert Risk"]}
              rows={[
                ["processed", "Node processed locally", "Fastest", "~5% chance"],
                ["confirmed", "66%+ validators voted", "+400ms", "~0.01% chance"],
                ["finalized", "31+ confirmation slots", "+12 seconds", "0% chance"],
              ]}
            />
            <InsightBox>
              <p className="text-neutral-300">
                We use <InlineCode>confirmed</InlineCode> commitment. Best balance of speed and safety. A reverted escrow creation is annoying but harmless &mdash; user just retries. We don&apos;t need finalized for non-critical operations.
              </p>
            </InsightBox>

            <Sub>Why Helius Over Public Solana RPC</Sub>
            <Table
              headers={["", "Public RPC", "Helius"]}
              rows={[
                ["Rate limit", "40 req/sec", "50+ req/sec"],
                ["Priority", "None", "Priority queue"],
                ["WebSocket", "Unreliable", "Dedicated"],
                ["Enhanced APIs", "No", "Yes (DAS, compressed NFTs)"],
                ["SLA", "Best effort", "99.9%"],
              ]}
            />
            <p>
              Config: <InlineCode>process.env.NEXT_PUBLIC_HELIUS_RPC_URL</InlineCode> with fallback to <InlineCode>api.devnet.solana.com</InlineCode>.
            </p>

            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Transaction sent, RPC crashes before returning signature:</strong> The transaction may still be in the mempool. User should wait and refresh rather than resend. A duplicate create with the same escrow_id is actually impossible &mdash; the PDA already exists, so <InlineCode>init</InlineCode> would fail with &quot;account already in use&quot;.
              </p>
            </EdgeBox>
          </Section>

          {/* ==================== PART II ==================== */}
          <PartHeader title="Part II: The Smart Contract" subtitle="The code that guards the money" />

          {/* Section 6 */}
          <Section id="s6" num={6} title="Anchor Framework &mdash; Why & How (Deep)">
            <p>
              Building with Anchor is like building with LEGO &mdash; pieces snap together safely and quickly. Building with native Solana is like carving from raw wood. Both make chairs, but LEGO has guardrails.
            </p>

            <Sub>What Anchor Gives Us</Sub>
            <Table
              headers={["Feature", "What It Does"]}
              rows={[
                ["#[program]", "Wraps our Rust module, generates instruction dispatching, handles discriminators"],
                ["#[derive(Accounts)]", "Generates account validation code from constraint declarations"],
                ["#[account]", "Marks struct as Anchor account. Auto-generates Borsh serialization, discriminator, space calculation"],
                ["init", "Creates + initializes account in one step. Allocates space, transfers rent, sets owner"],
                ["has_one", "Constraint that checks if an account field matches a provided account"],
                ["constraint", "Custom boolean assertion for business logic guards"],
                ["seeds + bump", "PDA derivation and verification built into account validation"],
              ]}
            />

            <Sub>IDL Generation</Sub>
            <p>
              Anchor reads our Rust code and generates <InlineCode>idl/trustify.json</InlineCode> &mdash; a complete JSON description of every instruction, account, type, and error. The frontend <InlineCode>Program</InlineCode> constructor uses this IDL to know how to serialize/deserialize data. It&apos;s the ABI equivalent for Solana.
            </p>

            <Sub>Discriminator Algorithm</Sub>
            <Code>{`SHA-256("account:Escrow") -> take first 8 bytes -> [55, 167, 209, ...]

Every Escrow account starts with these 8 bytes.
This is how getProgramAccounts filters work:
  filters: [{ memcmp: { offset: 0, bytes: "<base58 of discriminator>" } }]

The RPC checks byte 0-7 of every account owned by our program.
Only accounts with matching discriminator are returned.`}</Code>

            <Sub>Borsh Serialization</Sub>
            <p>
              Borsh (Binary Object Representation Serializer for Hashing) is purpose-built for blockchain: deterministic (same struct always produces identical bytes), compact (no field names stored), fast, and designed so the output is safely hashable.
            </p>
            <Table
              headers={["Type", "Encoding", "Size"]}
              rows={[
                ["u8", "1 byte, raw", "1B"],
                ["u64", "8 bytes, little-endian", "8B"],
                ["bool", "1 byte (0 or 1)", "1B"],
                ["Pubkey", "32 bytes, raw", "32B"],
                ["String", "4 byte LE length + UTF-8 bytes", "4 + len"],
                ["Option<T>", "1 byte flag + T if Some", "1 or 1+sizeof(T)"],
                ["Enum", "1 byte variant index", "1B (for simple enums)"],
              ]}
            />
            <InsightBox>
              <p className="text-neutral-300">
                This is why we know EXACT byte offsets for memcmp filters. The serialization is deterministic and predictable &mdash; byte 8 is always the start of the client pubkey, byte 40 is always the start of the freelancer pubkey, etc.
              </p>
            </InsightBox>

            <Sub>BPF Virtual Machine</Sub>
            <p>
              Solana programs run in a sandboxed BPF (Berkeley Packet Filter) VM. Programs can ONLY access accounts explicitly passed to them. No I/O, no network calls, no accessing other accounts secretly. Pure computation + account state manipulation. <InlineCode>anchor build</InlineCode> compiles Rust to BPF bytecode, <InlineCode>anchor deploy</InlineCode> uploads it to Solana, and the Program ID = that account&apos;s address.
            </p>
          </Section>

          {/* Section 7 */}
          <Section id="s7" num={7} title="Program Derived Addresses &mdash; The Algorithm">
            <p>
              Imagine a magical formula. You put in your name and a number, and it always gives you the same locker number. But nobody has a key to that locker &mdash; only the school&apos;s program can open it. That&apos;s a PDA.
            </p>

            <Sub>The Algorithm Step by Step</Sub>
            <Code>{`1. Take seeds: ["escrow", client_pubkey (32 bytes), escrow_id (8 bytes LE)]
2. Append program_id (32 bytes)
3. Append candidate bump byte (start at 255)
4. Compute SHA-256(seeds + program_id + [bump] + "ProgramDerivedAddress")
5. Check: is the result a valid point on the ed25519 curve?

   YES -> UNSAFE. Someone could have the private key.
          Decrement bump (254, 253, ...), try again.

   NO  -> SAFE. No possible private key exists.
          Return (address, bump).

Typical bump: 253-255 (first few tries usually work)`}</Code>

            <WhyBox>
              <p className="text-neutral-300">
                <strong>Why off-curve?</strong> ed25519 public keys are points on an elliptic curve. For every point ON the curve, a corresponding private key exists. If our PDA landed on the curve, someone could derive that private key and steal the escrowed funds. An off-curve point has NO possible private key &mdash; only our program can authorize operations on it. This is the mathematical foundation of escrow security.
              </p>
            </WhyBox>

            <Sub>Our PDA Seed Design</Sub>
            <Code>{`Seeds: [b"escrow", client.key().as_ref(), &escrow_id.to_le_bytes()]

"escrow"     -> constant, namespaces our PDAs within the program
client_pubkey -> each client gets their own PDA namespace
escrow_id    -> u64 (Date.now() in milliseconds) -> practically unique per client

TypeScript equivalent:
  const escrowIdBuffer = Buffer.alloc(8)
  escrowIdBuffer.writeBigUInt64LE(BigInt(escrowId))
  PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), clientPubkey.toBuffer(), escrowIdBuffer],
    programId
  ) // -> [escrowPDA, bump]`}</Code>

            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Same client + same escrow_id = same PDA.</strong> The <InlineCode>init</InlineCode> constraint would fail with &quot;account already exists&quot;. Since escrow_id is <InlineCode>Date.now()</InlineCode> (millisecond timestamp), this requires creating two escrows in the same millisecond. Two different clients with the same escrow_id get DIFFERENT PDAs because the client pubkey is in the seed.
              </p>
            </EdgeBox>
          </Section>

          {/* Section 8 */}
          <Section id="s8" num={8} title="The Escrow Account &mdash; Byte-Level Anatomy">
            <p>
              The escrow account is a detailed receipt stored in a safe. It records who paid, who&apos;s getting paid, how much, and what state the deal is in. Here is the exact memory layout:
            </p>

            <Diagram>{`┌─────────────────────────────────────────────────────────────────┐
│ Bytes 0-7:     Anchor Discriminator (8B)                        │  <- SHA-256("account:Escrow")[0..8]
│ Bytes 8-39:    Client Pubkey (32B)                              │  <- Who created & funded this
│ Bytes 40-71:   Freelancer Pubkey (32B)                          │  <- Worker (or 0x00..00 if open)
│ Bytes 72-79:   Amount (8B, u64 LE)                              │  <- Locked SOL in lamports
│ Byte 80:       Status (1B, enum variant index)                  │  <- 0=Open 1=InProgress 2=Submitted
│                                                                 │     3=Completed 4=Cancelled 5=Disputed
│ Bytes 81-88:   Escrow ID (8B, u64 LE)                           │  <- Unique ID (ms timestamp)
│ Bytes 89-96:   Created At (8B, i64 LE)                          │  <- Unix timestamp (from Clock)
│ Bytes 97-100:  Description Length (4B, u32 LE)                  │  <- Borsh string length prefix
│ Bytes 101+:    Description String (variable, max 200 UTF-8)     │  <- Contains "ipfs://CID"
│ Next 4B:       Submission CID Length (4B, u32 LE)               │  <- Borsh string length prefix
│ Variable:      Submission CID String (max 200 UTF-8)            │  <- Proof of work CID
│ Last byte:     Bump (1B, u8)                                    │  <- PDA bump seed
└─────────────────────────────────────────────────────────────────┘

Total max space: 8 + 32 + 32 + 8 + 1 + 8 + 8 + (4+200) + (4+200) + 1 = 506 bytes
Anchor space:    8 + Escrow::INIT_SPACE`}</Diagram>

            <Sub>Why These Offsets Matter</Sub>
            <p>
              This is how <InlineCode>memcmp</InlineCode> filters work. To find all escrows by a specific client, we tell the RPC: &quot;at offset 8 (after discriminator), the 32 bytes must equal this client&apos;s pubkey&quot;. The RPC scans accounts WITHOUT decoding them &mdash; pure byte matching. Blazing fast.
            </p>
            <Code>{`// Fetch all escrows where I am the client:
filters: [{ memcmp: { offset: 8, bytes: myWallet.toBase58() } }]

// Fetch all escrows where I am the freelancer:
filters: [{ memcmp: { offset: 40, bytes: myWallet.toBase58() } }]
// offset 40 = 8 (discriminator) + 32 (client pubkey)`}</Code>

            <Sub>Why u64 for Amount</Sub>
            <p>
              Maximum u64 value = 18,446,744,073,709,551,615 lamports = ~18.4 billion SOL. Way more than the total SOL supply (~570M). A u32 would only hold ~4.29 SOL &mdash; far too small.
            </p>

            <Sub>BN.js Necessity</Sub>
            <p>
              JavaScript&apos;s <InlineCode>Number.MAX_SAFE_INTEGER</InlineCode> = 2^53 - 1 = 9,007,199,254,740,991. A u64 goes up to 2^64. BN.js handles arbitrary precision safely. Without it, amounts over ~9 SOL could have precision errors in JavaScript.
            </p>
          </Section>

          {/* Section 9 */}
          <Section id="s9" num={9} title="The State Machine &mdash; Every Transition, Every Guard">
            <Diagram>{`  ┌──────────┐  accept_escrow  ┌──────────────┐  submit_work  ┌───────────┐  release_funds  ┌───────────┐
  │   OPEN   │───────────────>│ IN PROGRESS  │─────────────>│ SUBMITTED │───────────────>│ COMPLETED │
  └──────────┘                └──────────────┘              └───────────┘                └───────────┘
       │                            │                             │
       │ cancel_escrow              │ raise_dispute               │ raise_dispute
       v                            v                             v
  ┌───────────┐              ┌───────────┐                 ┌───────────┐
  │ CANCELLED │              │ DISPUTED  │                 │ DISPUTED  │
  └───────────┘              └───────────┘                 └───────────┘

  Terminal states: COMPLETED, CANCELLED, DISPUTED  (no further transitions)`}</Diagram>

            <Sub>Every Transition</Sub>
            <Table
              headers={["From", "To", "Instruction", "Who Signs", "Funds Move?", "Key Validations"]}
              rows={[
                ["Open", "InProgress", "accept_escrow", "Freelancer", "No", "status==Open, signer!=client, freelancer matches or is default(0)"],
                ["Open", "Cancelled", "cancel_escrow", "Client", "PDA->Client (refund)", "status==Open, signer==client"],
                ["InProgress", "Submitted", "submit_work", "Freelancer", "No", "status==InProgress, signer==freelancer, CID not empty"],
                ["InProgress", "Disputed", "raise_dispute", "Either party", "No", "status==InProgress, signer is participant"],
                ["Submitted", "Completed", "release_funds", "Client", "PDA->Freelancer", "status==Submitted|InProgress, signer==client, freelancer matches"],
                ["Submitted", "Disputed", "raise_dispute", "Either party", "No", "status==Submitted, signer is participant"],
              ]}
            />

            <Sub>Race Condition Analysis</Sub>
            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Two freelancers accept the same open escrow simultaneously:</strong> Both transactions enter the mempool. The leader orders them sequentially. First one succeeds (status changes to InProgress). Second one fails (status is now InProgress, not Open &rarr; InvalidStatus error). Solana&apos;s single-threaded-per-account processing guarantees atomicity.
              </p>
            </EdgeBox>
            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Client cancels while freelancer accepts:</strong> Same race &mdash; first transaction to be ordered wins. Either cancellation succeeds and freelancer gets InvalidStatus, or acceptance succeeds and client gets CannotCancelInProgress.
              </p>
            </EdgeBox>
            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Client releases while freelancer submits (both from InProgress):</strong> Release accepts InProgress status, so if it executes first, status becomes Completed and the submit fails. If submit executes first, status becomes Submitted and release still succeeds (it accepts both states).
              </p>
            </EdgeBox>
          </Section>

          {/* Section 10 */}
          <Section id="s10" num={10} title="All 6 Instructions &mdash; Complete Walkthrough">
            <Sub>10.1 &mdash; create_escrow: &quot;Lock money in the vault&quot;</Sub>
            <Code>{`// Rust: Account Constraints
#[derive(Accounts)]
#[instruction(amount: u64, description: String, escrow_id: u64)]
pub struct CreateEscrow<'info> {
    #[account(
        init,                                                    // Create new account
        payer = client,                                          // Client pays rent
        space = 8 + Escrow::INIT_SPACE,                          // Discriminator + data
        seeds = [b"escrow", client.key().as_ref(),               // PDA seeds
                 &escrow_id.to_le_bytes()],
        bump                                                     // Auto-find bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub client: Signer<'info>,                                   // Must sign & is mutable (pays)
    pub system_program: Program<'info, System>,                  // Needed for CPI transfer
}

// Logic:
1. Validate: amount > 0, description <= 200 chars, receiver != client
2. system_program::transfer(client -> escrow_PDA, amount)       // CPI to System Program
3. Set all escrow fields (client, freelancer, amount, status=Open, etc.)
4. emit!(EscrowCreated { ... })`}</Code>
            <WhyBox>
              <p className="text-neutral-300">
                <InlineCode>init</InlineCode> does a lot behind the scenes: computes PDA, calls <InlineCode>system_program::create_account</InlineCode> (allocates space + sets owner to our program + transfers rent), then writes the 8-byte discriminator.
              </p>
            </WhyBox>

            <Sub>10.2 &mdash; accept_escrow: &quot;Claim the job&quot;</Sub>
            <Code>{`// Rust: Account Constraints
#[derive(Accounts)]
pub struct AcceptEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump                                       // Verify PDA matches stored bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub freelancer: Signer<'info>,                               // Must sign, becomes the worker
}

// Logic:
1. Verify status == Open                                         // Can't accept twice
2. Verify signer != client                                       // Can't accept your own escrow
3. If escrow.freelancer == Pubkey::default() -> open escrow, set freelancer = signer
   If escrow.freelancer == signer -> directed escrow, allowed
   Otherwise -> UnauthorizedFreelancer error                     // Wrong person for directed escrow
4. Set status = InProgress
5. emit!(EscrowAccepted { escrow, freelancer })

// No CPI needed — pure state mutation. Cost: ~5000 lamports tx fee.
// TypeScript: program.methods.acceptEscrow()
//   .accounts({ escrow: escrowPubkey, freelancer: wallet.publicKey }).rpc()`}</Code>
            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Open vs Directed escrows:</strong> If <InlineCode>escrow.freelancer == Pubkey::default()</InlineCode> (all zeros), anyone can accept. If the client specified a receiver at creation, only that exact wallet can accept. This is checked by comparing <InlineCode>escrow.freelancer</InlineCode> with the signer&apos;s public key.
              </p>
            </EdgeBox>

            <Sub>10.3 &mdash; submit_work: &quot;Here&apos;s my proof&quot;</Sub>
            <Code>{`// Rust: Account Constraints
#[derive(Accounts)]
pub struct SubmitWork<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub freelancer: Signer<'info>,
}

// Logic:
1. Verify status == InProgress                                  // Must be working on it
2. Verify signer == escrow.freelancer                           // Only assigned freelancer
3. Verify !submission_cid.is_empty()                            // Must provide proof
4. Set escrow.submission_cid = submission_cid                   // Store IPFS CID on-chain
5. Set status = Submitted
6. emit!(WorkSubmitted { escrow, freelancer })

// The CID stored on-chain is immutable proof that work was submitted
// at this exact point in blockchain history. Nobody can claim the
// freelancer didn't submit, and nobody can claim they submitted
// different work — the CID is a cryptographic fingerprint.

// TypeScript: program.methods.submitWork(submissionCid)
//   .accounts({ escrow: escrowPubkey, freelancer: wallet.publicKey }).rpc()`}</Code>
            <InsightBox>
              <p className="text-neutral-300">
                The submission CID points to a SubmissionMetadata JSON on IPFS containing file references, GitHub URL, checklist completion, and verification results. This creates a complete, tamper-proof evidence trail: on-chain CID &rarr; IPFS metadata &rarr; individual files.
              </p>
            </InsightBox>

            <Sub>10.4 &mdash; release_funds: &quot;Pay the worker&quot;</Sub>
            <Code>{`// The critical instruction. Direct lamport manipulation:
let amount = escrow.amount;
escrow.status = EscrowStatus::Completed;

**ctx.accounts.escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
**ctx.accounts.freelancer.to_account_info().try_borrow_mut_lamports()? += amount;`}</Code>
            <WhyBox>
              <p className="text-neutral-300">
                <strong>Why direct lamport manipulation instead of system_program::transfer?</strong> The escrow PDA is owned by OUR program, not the System Program. <InlineCode>system_program::transfer</InlineCode> only works for System Program-owned accounts. Since we own the escrow account, we can directly modify its lamport balance. This is a standard Solana pattern for program-owned accounts.
              </p>
            </WhyBox>
            <EdgeBox>
              <p className="text-neutral-300">
                <strong>What about remaining rent lamports?</strong> Only <InlineCode>escrow.amount</InlineCode> is transferred. The rent-exempt minimum stays in the PDA. This is technically &quot;stuck&quot; unless a <InlineCode>close_escrow</InlineCode> instruction is added to recover rent.
              </p>
            </EdgeBox>

            <Sub>10.5 &mdash; cancel_escrow: &quot;I changed my mind&quot;</Sub>
            <Code>{`// Rust: Account Constraints
#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub client: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Logic:
1. Verify status == Open                                    // CannotCancelInProgress if not
2. Verify signer == escrow.client                           // Only the client can cancel
3. Read amount, set status = Cancelled
4. Direct lamport manipulation (same as release_funds):
   **escrow.to_account_info().try_borrow_mut_lamports()? -= amount;
   **client.to_account_info().try_borrow_mut_lamports()? += amount;
5. emit!(EscrowCancelled { escrow, client, refunded_amount })

// CRITICAL: Cancel only works from Open. Once a freelancer accepts,
// the client CANNOT pull funds back. This protects freelancers from
// starting work and then having the rug pulled.`}</Code>
            <WhyBox>
              <p className="text-neutral-300">
                The &quot;only cancel from Open&quot; design is intentional. It creates a commitment mechanism: once a freelancer invests time (accepts), the client&apos;s funds are locked. This incentivizes clients to only create escrows they intend to follow through on, and gives freelancers confidence to start working.
              </p>
            </WhyBox>

            <Sub>10.6 &mdash; raise_dispute: &quot;Something&apos;s wrong&quot;</Sub>
            <Code>{`// Rust: Account Constraints
#[derive(Accounts)]
pub struct RaiseDispute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", escrow.client.as_ref(), &escrow.escrow_id.to_le_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(mut)]
    pub caller: Signer<'info>,                              // Either client OR freelancer
}

// Logic:
1. Verify status == InProgress || status == Submitted       // Can't dispute Open/Completed/Cancelled
2. Verify caller == escrow.client || caller == escrow.freelancer  // Only participants
3. Set status = Disputed
4. emit!(DisputeRaised { escrow, raised_by: caller })

// No fund movement. No resolution mechanism on-chain.
// Disputed is a TERMINAL state — no further transitions.
// Funds remain locked in the PDA until off-chain resolution.`}</Code>
            <WhyBox>
              <p className="text-neutral-300">
                Dispute resolution is HARD to automate fairly. It requires human judgment &mdash; &quot;did the freelancer really deliver what was asked?&quot; is not a question code can answer. We flag it on-chain as an immutable record of when and by whom the dispute was raised, then resolve off-chain. A future version could add DAO-based arbitration, time-locked resolution, or third-party arbitrator selection with staked reputation.
              </p>
            </WhyBox>
          </Section>

          {/* Section 11 */}
          <Section id="s11" num={11} title="Security Analysis &mdash; Attack Vectors & Defenses">
            <AttackBox>
              <p className="text-neutral-300">
                <strong>Unauthorized fund withdrawal:</strong> Only our program can modify PDA lamports (Solana runtime enforces that only the account owner can debit). Our code checks signer == client for release/cancel. No other instruction moves funds. The runtime + our constraints = double guard.
              </p>
            </AttackBox>

            <AttackBox>
              <p className="text-neutral-300">
                <strong>Replay attack (resend old transaction):</strong> Solana transactions include <InlineCode>recentBlockhash</InlineCode> which is valid for ~90 seconds. After expiry, the transaction is rejected. Same transaction cannot be replayed later.
              </p>
            </AttackBox>

            <AttackBox>
              <p className="text-neutral-300">
                <strong>Frontrunning (see mempool, jump ahead):</strong> Solana&apos;s leader schedule is predetermined. Transactions are FIFO within each block. Unlike Ethereum where miners can reorder transactions (MEV), Solana&apos;s architecture makes frontrunning much harder. Escrow acceptance is first-come-first-served at the consensus layer.
              </p>
            </AttackBox>

            <AttackBox>
              <p className="text-neutral-300">
                <strong>Reentrancy:</strong> Solana&apos;s runtime prevents reentrancy by default. An instruction cannot call back into the same program while it&apos;s executing. Unlike Ethereum&apos;s infamous reentrancy bugs (The DAO hack), this attack vector doesn&apos;t exist on Solana.
              </p>
            </AttackBox>

            <AttackBox>
              <p className="text-neutral-300">
                <strong>Account confusion (pass wrong accounts):</strong> Anchor&apos;s <InlineCode>#[derive(Accounts)]</InlineCode> validates EVERY constraint before instruction logic runs. Wrong account type &rarr; discriminator mismatch &rarr; error. Wrong PDA &rarr; seeds don&apos;t match &rarr; error. Wrong signer &rarr; signature validation fails.
              </p>
            </AttackBox>

            <AttackBox>
              <p className="text-neutral-300">
                <strong>Integer overflow on amount:</strong> Rust panics on overflow in debug mode. In release builds, Anchor&apos;s <InlineCode>constraint</InlineCode> checks validate amounts before operations. The <InlineCode>require!(amount &gt; 0)</InlineCode> guard prevents zero-amount escrows.
              </p>
            </AttackBox>

            <AttackBox>
              <p className="text-neutral-300">
                <strong>Client sets themselves as freelancer:</strong> Caught by <InlineCode>require!(receiver != client.key(), ClientCannotBeFreelancer)</InlineCode> in create_escrow, and <InlineCode>require!(freelancer.key() != escrow.client)</InlineCode> in accept_escrow.
              </p>
            </AttackBox>

            <Sub>All 10 Error Codes</Sub>
            <Table
              headers={["Code", "Name", "When It Fires"]}
              rows={[
                ["6000", "InvalidAmount", "create_escrow with amount = 0"],
                ["6001", "DescriptionTooLong", "create_escrow with description > 200 chars"],
                ["6002", "InvalidStatus", "Any instruction called on wrong status"],
                ["6003", "ClientCannotBeFreelancer", "Client tries to be their own freelancer"],
                ["6004", "UnauthorizedFreelancer", "Non-freelancer calls submit_work"],
                ["6005", "UnauthorizedClient", "Non-client calls release/cancel"],
                ["6006", "InvalidFreelancer", "Freelancer address mismatch in release_funds"],
                ["6007", "CannotCancelInProgress", "cancel_escrow after freelancer accepted"],
                ["6008", "UnauthorizedCaller", "Non-participant calls raise_dispute"],
                ["6009", "EmptySubmissionCid", "submit_work with empty CID string"],
              ]}
            />
          </Section>

          {/* ==================== PART III ==================== */}
          <PartHeader title="Part III: Off-Chain Storage" subtitle="Where the rich data lives" />

          {/* Section 12 */}
          <Section id="s12" num={12} title="IPFS &mdash; The Content-Addressable Web">
            <Sub>Content Addressing vs Location Addressing</Sub>
            <p>
              The traditional web uses location addressing: &quot;go to server X, folder Y, file Z&quot;. If the server dies, the content is gone. IPFS uses content addressing: the address IS the content&apos;s fingerprint. The same content always has the same address, regardless of where it&apos;s stored.
            </p>
            <Diagram>{`Traditional Web (Location-based):
  https://example.com/files/report.pdf
  -> "Go to example.com, find /files/report.pdf"
  -> Server dies? Content GONE.
  -> Server changes file? Same URL, different content!

IPFS (Content-based):
  ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3ockltqwsi3dcea
  -> "Find the content with THIS fingerprint"
  -> Content could be on ANY node. Or many nodes.
  -> Content changes? Different fingerprint = different address = different content!
  -> IMMUTABLE by design.`}</Diagram>

            <Sub>How CIDs Are Computed</Sub>
            <Code>{`CID = multibase + version + multicodec + multihash

multibase:  encoding format (base32, base58btc, etc.)
version:    CIDv0 (Qm...) or CIDv1 (bafy...)
multicodec: content type (dag-pb, raw, etc.)
multihash:  hash function identifier + digest

Example CIDv1: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3...
  b         = base32 encoding
  afy       = CIDv1, dag-pb codec
  beigdy... = SHA-256 hash of the content

Change one byte of content -> different hash -> different CID -> it's a DIFFERENT file.`}</Code>

            <Sub>DAG Structure (Directed Acyclic Graph)</Sub>
            <p>
              Large files are split into 256KB chunks, each hashed to get its own CID. These chunks are organized as a DAG &mdash; a tree where parent nodes reference child CIDs. The root CID of the DAG represents the entire file.
            </p>
            <Diagram>{`A 1MB file split into 4 chunks:

            Root CID: bafybeiabc...
           /      |       \\       \\
     Chunk 0   Chunk 1   Chunk 2   Chunk 3
     256KB     256KB     256KB     256KB
     CID: baf  CID: baf  CID: baf  CID: baf
     yb01...   yb02...   yb03...   yb04...

Root node contains: [link_to_chunk0, link_to_chunk1, link_to_chunk2, link_to_chunk3]
Root CID = hash(root_node_data)

Directories work the same way:
            project/
           /        \\
     README.md    src/
     CID: baf...   |
                  index.ts
                  CID: baf...

Each directory is a DAG node linking to its children's CIDs.`}</Diagram>
            <InsightBox>
              <p className="text-neutral-300">
                For our use case (metadata JSON ~1KB, files &lt;10MB), most uploads fit in a single chunk. No DAG splitting needed. But understanding the DAG model explains why IPFS can handle files of any size and why CIDs are always the same length regardless of content size.
              </p>
            </InsightBox>

            <Sub>DHT (Distributed Hash Table) &mdash; Peer Discovery</Sub>
            <p>
              When you request a CID, how does IPFS find which nodes have it? The DHT is a distributed lookup table spread across all IPFS nodes. Each node is responsible for a portion of the keyspace (determined by how &quot;close&quot; their node ID is to a CID in XOR distance).
            </p>
            <Code>{`You request: bafybeigdyrzt5sfp7...

1. Your node checks local cache — not found
2. Your node computes XOR distance between CID and known peers
3. Queries the closest peers: "Do you have bafybeigdyrzt5sfp7...?"
4. Those peers either:
   a. Have it -> return the content
   b. Don't have it -> return peers CLOSER to the CID (iterative lookup)
5. Repeat step 3-4 until content found or all routes exhausted
6. Content streams back to your node, gets cached locally

Lookup complexity: O(log N) where N = number of nodes in the network
Typical lookup time: 1-5 seconds for popular content, 5-30s for rare content`}</Code>

            <Sub>Garbage Collection & Pinning</Sub>
            <p>
              IPFS nodes have limited storage. They periodically garbage-collect unpinned content &mdash; data that was cached during retrieval but nobody explicitly asked to keep. If NO node in the entire network pins your data, it eventually disappears.
            </p>
            <Diagram>{`Content lifecycle without pinning:
  Upload -> Stored on your node -> Propagated to requesting nodes -> GC'd after cache TTL

Content lifecycle WITH Pinata pinning:
  Upload -> Pinata stores + pins -> Available via Pinata gateway (CDN) -> PERMANENT
                                    Also discoverable via DHT by any IPFS node`}</Diagram>

            <Sub>Our Caching Strategy</Sub>
            <Code>{`// lib/ipfs.ts
const metadataCache = new Map<string, EscrowMetadata>()    // In-memory cache
const submissionCache = new Map<string, SubmissionMetadata>()

// Fetch with 10-second timeout:
const res = await fetch(\`https://\${GATEWAY}/ipfs/\${cid}\`, {
  signal: AbortSignal.timeout(10_000),
})

// Cache hit -> instant return. Cache miss -> fetch from Pinata gateway.
// Cache persists for the lifetime of the browser tab (no TTL eviction).
// Page refresh = fresh cache = fresh data.`}</Code>
          </Section>

          {/* Section 13 */}
          <Section id="s13" num={13} title="Why Pinata &mdash; The Decision Matrix">
            <Table
              headers={["Option", "Pros", "Cons", "Cost"]}
              rows={[
                ["Run your own IPFS node", "Full control, no dependencies", "Ops burden, SLA responsibility, bandwidth costs, single point of failure", "$50-200/mo for reliable hosting"],
                ["Pinata", "Simple API, reliable CDN, dedicated gateway, free tier", "Vendor dependency, rate limits on free tier", "Free: 100 files/500MB. Paid: $20/mo for 25K files/50GB"],
                ["Infura IPFS", "Reliable, part of ConsenSys", "Shutting down IPFS gateway", "Was free, now sunsetting"],
                ["Web3.Storage", "Free, Filecoin-backed", "Slower retrieval, less mature gateway", "Free for now"],
                ["NFT.Storage", "Free, designed for NFT metadata", "Not ideal for non-NFT data, uncertain future", "Free"],
              ]}
            />
            <WhyBox>
              <p className="text-neutral-300">
                Pinata won because: (1) dead-simple upload API with JWT auth, (2) dedicated gateway with CDN for fast reads, (3) generous free tier for development, (4) our metadata is ~1KB per escrow &mdash; 25,000 escrows/month on the $20 paid tier, (5) battle-tested reliability with major NFT platforms.
              </p>
            </WhyBox>
          </Section>

          {/* Section 14 */}
          <Section id="s14" num={14} title="The Upload Pipeline &mdash; Every Step">
            <Diagram>{`USER'S BROWSER                    OUR SERVER                      PINATA
      │                                 │                              │
      │  1. User drops file             │                              │
      │  2. Validate < 10MB             │                              │
      │  3. Build FormData              │                              │
      │                                 │                              │
      │  POST /api/upload ──────────────>│                              │
      │                                 │  4. Check PINATA_JWT exists  │
      │                                 │  5. Extract file from form   │
      │                                 │  6. POST pinning/pinFileToIPFS
      │                                 │─────────────────────────────>│
      │                                 │                              │  7. Store file
      │                                 │                              │  8. Pin to nodes
      │                                 │  { IpfsHash, PinSize }       │  9. Return CID
      │                                 │<─────────────────────────────│
      │  { cid, size }                  │                              │
      │<────────────────────────────────│                              │
      │                                 │                              │
      │  10. Store CID in state         │                              │
      │  11. Create metadata JSON       │                              │
      │  12. Upload metadata (same flow)│                              │
      │  13. Call createEscrow on-chain │                              │
      │      with "ipfs://{metadataCID}"│                              │`}</Diagram>

            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Upload succeeds but on-chain transaction fails?</strong> Result: orphaned IPFS data. This is acceptable &mdash; metadata is tiny (&lt;1KB), Pinata&apos;s free tier handles it, and no cleanup mechanism is needed. The CID just sits pinned until manually unpinned.
              </p>
            </EdgeBox>

            <Sub>Server-Side Upload Code</Sub>
            <Code>{`// app/api/upload/route.ts (simplified)
export async function POST(request: NextRequest) {
  const jwt = process.env.PINATA_JWT           // Server-only, never exposed to browser
  const formData = await request.formData()
  const file = formData.get("file")            // Max 10MB enforced

  const pinataForm = new FormData()
  pinataForm.append("file", file)

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: \`Bearer \${jwt}\` },
    body: pinataForm,
  })

  const data = await res.json()
  return NextResponse.json({ cid: data.IpfsHash, size: data.PinSize })
}`}</Code>
          </Section>

          {/* Section 15 */}
          <Section id="s15" num={15} title="Metadata Schema &mdash; The Complete Picture">
            <Sub>EscrowMetadata (v2)</Sub>
            <Code>{`interface EscrowMetadata {
  version: number                    // Schema version (currently 2)
  title: string                      // Human-readable escrow title
  description: string                // Detailed task description
  files: EscrowFileRef[]             // Attached files (specs, designs, etc.)
  deadline?: string                  // ISO date string (informational only)
  receiverMode?: "open" | "directed" // Open to all or specific freelancer
  whitelist?: string[]               // Wallet addresses allowed to accept
  blocklist?: string[]               // Wallet addresses blocked from accepting
  techstack?: string[]               // Required technologies ["React", "Rust"]
  requirements?: string[]            // Checklist items freelancer must satisfy
}

interface EscrowFileRef {
  name: string                       // Original filename
  cid: string                        // IPFS CID of the file
  size: number                       // File size in bytes
  mimeType: string                   // MIME type (application/pdf, image/png, etc.)
}`}</Code>

            <Sub>SubmissionMetadata</Sub>
            <Code>{`interface SubmissionMetadata {
  version: number                    // Schema version
  files: EscrowFileRef[]             // Deliverable files
  githubUrl?: string                 // Repository URL for verification
  checklistCompleted?: boolean[]     // Parallel to escrow.requirements
  verification?: {                   // GitHub verification results
    verified: boolean
    techstackMatch: string[]         // Which techs were found
    hasCode: boolean                 // Real source code detected
    commitCount: number              // Commit history depth
    languages: Record<string, number> // Language percentages
  }
}`}</Code>

            <Sub>On-Chain vs Off-Chain Decision</Sub>
            <Table
              headers={["Field", "Storage", "Why"]}
              rows={[
                ["amount", "On-chain", "Contract MUST enforce exact payment amount"],
                ["status", "On-chain", "State machine transitions must be atomic and validated"],
                ["client/freelancer", "On-chain", "Authorization checks require these"],
                ["deadline", "Off-chain (IPFS)", "Informational only, not enforced by contract"],
                ["title/description", "Off-chain (IPFS)", "Rich text too expensive on-chain (~$0.001/byte)"],
                ["files", "Off-chain (IPFS)", "Binary data can't go on-chain"],
                ["whitelist/blocklist", "Off-chain (IPFS)", "Frontend-enforced, not contract-enforced"],
                ["techstack", "Off-chain (IPFS)", "Verification is off-chain (GitHub API)"],
              ]}
            />

            <InsightBox>
              <p className="text-neutral-300">
                The <InlineCode>version</InlineCode> field enables forward compatibility. If we add fields in v3, old frontends reading v2 metadata won&apos;t crash because they simply ignore unknown fields. And new frontends can handle both v1 and v2 gracefully.
              </p>
            </InsightBox>
          </Section>

          {/* ==================== PART IV ==================== */}
          <PartHeader title="Part IV: Frontend Deep Dive" subtitle="How the user interacts with the blockchain" />

          {/* Section 16 */}
          <Section id="s16" num={16} title="Next.js & React Architecture">
            <Sub>Why Each Choice</Sub>
            <Table
              headers={["Technology", "Why We Chose It", "Alternative Rejected"]}
              rows={[
                ["Next.js 15", "SSR, API routes, file-based routing, image optimization, Turbopack", "Vite (no SSR), CRA (deprecated)"],
                ["React 19", "Concurrent features, suspense improvements, use() hook", "React 18 (no concurrent features)"],
                ["TypeScript", "Type safety for Pubkey, BN, EscrowAccount — catches wrong types at compile time", "JavaScript (runtime errors only)"],
                ["Tailwind CSS", "Utility-first, no context switching, dark theme via CSS vars, responsive", "CSS Modules (more files), styled-components (runtime cost)"],
                ["Radix UI", "Accessible primitives, unstyled = our dark theme, keyboard nav free", "MUI (opinionated styling), Headless UI (fewer components)"],
                ["Lucide", "Tree-shakeable, consistent style, MIT license, 1000+ icons", "Heroicons (fewer icons), FontAwesome (heavy)"],
                ["Framer Motion", "Declarative animations, gesture support, layout animations", "CSS animations (less capable), react-spring (different API)"],
                ["No state management lib", "useState sufficient for page-scoped state, no cross-page state needed", "Redux/Zustand (overkill, adds bundle size)"],
              ]}
            />

            <Sub>Component Architecture</Sub>
            <Diagram>{`app/layout.tsx
  └─ WalletContextProvider (Solana wallet context)
       └─ app/page.tsx (Landing page)
       └─ app/dashboard/page.tsx
            └─ DashboardContent
                 ├─ WalletInfo (balance, airdrop)
                 ├─ CreateEscrowForm (form + IPFS upload)
                 ├─ Tabs: My Escrows | Receivable | Open
                 │    └─ EscrowCard[] (for each escrow)
                 │         └─ EscrowDetailDialog
                 └─ StatusFilter, RefreshButton`}</Diagram>
          </Section>

          {/* Section 17 */}
          <Section id="s17" num={17} title="Wallet Integration &mdash; The Full Stack">
            <Sub>Provider Hierarchy</Sub>
            <Code>{`<ConnectionProvider endpoint={NETWORK}>
  <WalletProvider wallets={[]} autoConnect>
    <WalletModalProvider>
      {children}
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>

ConnectionProvider: Manages the RPC connection
WalletProvider: Detects installed wallets, manages connection state
WalletModalProvider: Provides the connect/disconnect modal UI`}</Code>

            <Sub>How Wallet Detection Works</Sub>
            <p>
              Browser wallets (Phantom, Solflare, Backpack) inject themselves via the Wallet Standard API or legacy <InlineCode>window.solana</InlineCode>. The <InlineCode>WalletProvider</InlineCode> with <InlineCode>wallets={`{[]}`}</InlineCode> auto-detects all Standard-compliant wallets. No manual adapter configuration needed.
            </p>

            <Sub>Transaction Signing Flow</Sub>
            <Code>{`1. User clicks action button (e.g., "Accept Escrow")
2. Our code calls program.methods.acceptEscrow().accounts({...}).rpc()
3. Anchor builds the Transaction object:
   - Sets recent blockhash (from RPC)
   - Adds instruction (serialized discriminator + args + account list)
4. AnchorProvider calls wallet.signTransaction(tx)
5. Wallet adapter sends to connected wallet extension
6. Wallet shows popup: "Approve transaction?"
7. User clicks Approve -> wallet signs with private key
8. Signed transaction returned to AnchorProvider
9. Provider calls connection.sendRawTransaction(signedTx)
10. Transaction sent to Helius RPC -> forwarded to leader
11. .rpc() waits for confirmation at "confirmed" commitment
12. Returns transaction signature string`}</Code>

            <Sub>useWallet Hook</Sub>
            <Code>{`const { publicKey, connected, signTransaction, sendTransaction } = useWallet()

publicKey:        PublicKey | null  (null when disconnected)
connected:        boolean
signTransaction:  (tx: Transaction) => Promise<Transaction>  (adds signature)
sendTransaction:  (tx: Transaction, connection: Connection) => Promise<string>`}</Code>

            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Wallet failure modes:</strong> (1) User rejects in popup &rarr; &quot;User rejected the request&quot; error. (2) Wallet disconnects mid-operation &rarr; publicKey becomes null, signTransaction throws. (3) Wrong network (mainnet wallet on devnet) &rarr; transaction fails with invalid blockhash. (4) Insufficient balance &rarr; System Program returns InsufficientFunds before our program even runs.
              </p>
            </EdgeBox>
          </Section>

          {/* Section 18 */}
          <Section id="s18" num={18} title="CoinGecko Price Integration">
            <Sub>Why Show Fiat Prices</Sub>
            <p>
              Users think in dollars, not SOL. &quot;I&apos;m sending $50&quot; is more meaningful than &quot;I&apos;m sending 0.33 SOL&quot;. Showing fiat equivalents reduces friction and builds trust.
            </p>

            <Sub>Implementation</Sub>
            <Code>{`// CoinGecko API (free, no auth required):
GET https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd,inr

Response: { "solana": { "usd": 150.42, "inr": 12535.67 } }

// useSolPrice hook:
- Fetches on component mount
- 60-second cache to stay under 30 req/min rate limit
- Returns { usd: number, inr: number } | null
- Null = price not yet loaded, show "..." placeholder

// SolAmount component:
- Input: lamports (BN)
- Output: "1.5 SOL (~$225.63 / ₹18,803)"
- Uses formatFiat() for locale-aware formatting`}</Code>

            <WhyBox>
              <p className="text-neutral-300">
                Why both USD and INR? Our target users include Indian freelancers and clients. Showing local currency makes the product feel native. Adding more currencies is trivial &mdash; just add to the <InlineCode>vs_currencies</InlineCode> parameter.
              </p>
            </WhyBox>
          </Section>

          {/* Section 19 */}
          <Section id="s19" num={19} title="GitHub Verification &mdash; The Complete Algorithm">
            <p>
              When a freelancer submits work with a GitHub URL, we verify the repository actually contains real code matching the required tech stack.
            </p>

            <Sub>The Verification Pipeline</Sub>
            <Code>{`POST /api/verify-github { githubUrl, techstack: ["React", "Rust"] }

1. Parse URL -> extract owner/repo
2. Fetch repo info: GET /repos/{owner}/{repo}
3. In parallel:
   a. GET /repos/{owner}/{repo}/languages -> { "TypeScript": 45000, "Rust": 30000 }
   b. GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1 -> file tree
   c. GET /repos/{owner}/{repo}/commits?per_page=1 -> commit count from Link header

4. Code verification:
   - Scan file tree for CODE_EXTENSIONS (.ts, .tsx, .rs, .py, .go, .sol, etc.)
   - Check if code files are in CODE_DIRS (src/, lib/, app/, programs/, etc.)
   - hasCode = true if real source files found in code directories

5. Tech stack matching:
   - For each required tech, check if repo languages include it
   - Use TECH_ALIASES: "React" -> check for ["javascript", "typescript", "tsx", "jsx"]
   - "Solana" -> check for ["rust"]
   - "Next.js" -> check for ["javascript", "typescript"]

6. verified = hasCode && (no techstack required || at least one tech matches)

Return: { verified, hasCode, commitCount, languages, techstackMatch }`}</Code>

            <Sub>TECH_ALIASES Map</Sub>
            <Table
              headers={["Tech Name", "Maps to GitHub Languages"]}
              rows={[
                ["react", "javascript, typescript, tsx, jsx"],
                ["next.js / nextjs", "javascript, typescript"],
                ["node / node.js", "javascript, typescript"],
                ["solana / anchor", "rust"],
                ["vue", "vue, javascript, typescript"],
                ["angular", "typescript, javascript"],
                ["svelte", "svelte, javascript, typescript"],
                ["django / flask", "python"],
                ["rails", "ruby"],
                ["spring", "java, kotlin"],
              ]}
            />

            <WhyBox>
              <p className="text-neutral-300">
                We check the file tree, not just the languages API, because the languages endpoint doesn&apos;t distinguish real source code from generated code or config files. Scanning for actual source directories (src/, lib/, app/) ensures the repo has meaningful code.
              </p>
            </WhyBox>

            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Rate limiting:</strong> Without <InlineCode>GITHUB_TOKEN</InlineCode>, the GitHub API allows only 60 req/hr. With a token, 5,000 req/hr. Each verification uses 4 API calls, so without auth you can verify ~15 repos/hour. In production, always set <InlineCode>GITHUB_TOKEN</InlineCode>.
              </p>
            </EdgeBox>
          </Section>

          {/* Section 20 */}
          <Section id="s20" num={20} title="The Dashboard &mdash; Data Flow Architecture">
            <Diagram>{`Component Mount
      │
      ▼
  fetchAll()  ─────────────────────────────────────────────────────────────
      │                               │                                   │
      ▼                               ▼                                   ▼
fetchClientEscrows()          fetchFreelancerEscrows()           fetchOpenEscrows()
  memcmp offset:8               memcmp offset:40                   fetch all + filter
  = my pubkey                   = my pubkey                        status == "Open"
      │                               │                                   │
      └───────────────────────────────┼───────────────────────────────────┘
                                      │
                                      ▼
                    safeFetchAllEscrows() for each
                      │
                      ▼
                    getProgramAccounts (raw RPC with discriminator filter)
                      │
                      ▼
                    For each raw account: program.coder.accounts.decode("Escrow", data)
                    If decode fails -> skip (old/incompatible account)
                      │
                      ▼
                    safeMapEscrow() -> EscrowAccount type
                      │
                      ▼
                    Deduplicate by publicKey (escrow may appear in multiple queries)
                      │
                      ▼
                    resolveEscrowMetadata() -> parallel IPFS fetches
                      extractCid(description) -> if starts with "ipfs://" -> fetch metadata
                      10-second timeout, in-memory cache
                      │
                      ▼
                    Categorize: My Escrows | Receivable | Open
                      │
                      ▼
                    Render EscrowCard for each
                      │
                      ▼
                    onAction={fetchAll}  (after any action, full refresh)`}</Diagram>

            <InsightBox>
              <p className="text-neutral-300">
                The <InlineCode>safeFetchAllEscrows</InlineCode> pattern is critical. Anchor&apos;s built-in <InlineCode>program.account.escrow.all()</InlineCode> throws if ANY account has the wrong layout (e.g., from a previous program version). Our approach decodes each account individually, skipping failures silently. This makes the app resilient to on-chain schema changes.
              </p>
            </InsightBox>
          </Section>

          {/* ==================== PART V ==================== */}
          <PartHeader title="Part V: Advanced Topics" subtitle="The stuff that separates experts from beginners" />

          {/* Section 21 */}
          <Section id="s21" num={21} title="Transaction Lifecycle &mdash; From Click to Confirmed">
            <p>Complete journey of a single &quot;Accept Escrow&quot; click:</p>
            <Code>{` 1. User clicks "Accept" button
 2. runAction("Accept", ...) called in EscrowCard component
 3. acceptEscrow(wallet, escrowAddress) in lib/solana.ts
 4. getProgram(wallet) -> creates AnchorProvider with wallet's signTransaction
 5. program.methods.acceptEscrow()
      .accounts({ escrow: escrowPubkey, freelancer: wallet.publicKey })
      .rpc()
 6. Anchor serializes: 8-byte discriminator for "accept_escrow" + (no args)
 7. Builds Transaction:
      - Fetches recent blockhash from RPC
      - Creates instruction with accounts + serialized data
      - Marks escrow as writable, freelancer as signer + writable
 8. wallet.signTransaction(tx) -> Phantom popup appears
 9. User clicks Approve -> wallet signs with ed25519 private key
10. Signed transaction -> connection.sendRawTransaction()
11. Helius RPC receives -> forwards to current leader validator
12. Leader validates:
      - Are all signatures valid? (ed25519 verification)
      - Are accounts writable? (runtime check)
      - Does the program exist? (program account lookup)
13. Leader loads BPF program, passes accounts
14. Program executes:
      - Anchor checks: PDA seeds match? bump matches? account discriminator?
      - Our logic: status == Open? signer != client? freelancer matches?
      - Updates: freelancer = signer, status = InProgress
      - Emits EscrowAccepted event
15. Leader includes in block -> propagates via Turbine
16. Validators vote on block -> reaches "confirmed" (66%+ votes)
17. RPC returns transaction signature to our frontend
18. .rpc() resolves with signature string
19. onAction?.() triggers fetchAll() -> UI refreshes with new status`}</Code>
          </Section>

          {/* Section 22 */}
          <Section id="s22" num={22} title="Cost Analysis &mdash; Every Penny Explained">
            <Table
              headers={["Operation", "Breakdown", "Total Cost"]}
              rows={[
                ["Create escrow", "Account rent (~0.003 SOL for ~506 bytes) + tx fee (0.000005 SOL) + escrow amount", "~0.003 SOL + deposit"],
                ["Accept escrow", "Transaction fee only", "~0.000005 SOL"],
                ["Submit work", "Transaction fee only", "~0.000005 SOL"],
                ["Release funds", "Transaction fee only", "~0.000005 SOL"],
                ["Cancel escrow", "Transaction fee only", "~0.000005 SOL"],
                ["Raise dispute", "Transaction fee only", "~0.000005 SOL"],
              ]}
            />

            <Sub>Total Protocol Overhead</Sub>
            <Code>{`Complete lifecycle (create + accept + submit + release):
  Rent:     ~0.003 SOL  (~$0.45 at $150/SOL)
  Tx fees:  ~0.00002 SOL (~$0.003)
  Total:    ~$0.45

Compare:
  PayPal:  2.9% + $0.30 on a $100 job = $3.20
  Trustify: $0.45 (fixed, regardless of amount)
  Savings: 7x cheaper on $100, 70x cheaper on $1000`}</Code>

            <Sub>IPFS Costs</Sub>
            <p>
              Free via Pinata&apos;s free tier for metadata. Each escrow metadata is ~1KB. Free tier allows 500MB = ~500,000 escrow metadata files. Even paid tier at $20/month handles 25,000 files = 25,000 escrows/month.
            </p>
          </Section>

          {/* Section 23 */}
          <Section id="s23" num={23} title="Known Limitations & Future Improvements">
            <Table
              headers={["Limitation", "Impact", "Future Solution"]}
              rows={[
                ["No on-chain dispute resolution", "Disputes require off-chain arbitration", "DAO voting or third-party arbitrator program"],
                ["No automatic deadline enforcement", "Deadline is metadata-only, not enforced by contract", "Clock-based auto-refund instruction using Solana Clock sysvar"],
                ["Whitelist/blocklist is frontend-only", "Savvy user can bypass via direct RPC calls", "Store on-chain (higher cost) or verify via signed message"],
                ["No partial release", "All-or-nothing fund release", "Milestone-based payments with partial release instruction"],
                ["No escrow fee", "Zero revenue model", "Optional platform fee (0.5-1%) collected in release_funds"],
                ["Devnet only", "Not on mainnet", "Mainnet deployment after security audit"],
                ["No account closure", "Completed escrows stay on-chain forever, rent locked", "Add close_escrow instruction to recover rent to client"],
                ["No SPL token support", "SOL only, no USDC/USDT", "Add token escrow with associated token accounts"],
              ]}
            />
          </Section>

          {/* Section 24 */}
          <Section id="s24" num={24} title="Mental Models for Blockchain Thinking">
            <InsightBox>
              <p className="text-neutral-300">
                <strong>The Immutable Ledger:</strong> Think of the blockchain as a permanent record etched in stone. Every escrow creation, acceptance, submission, and payment is there forever. You can add entries but never erase or modify previous ones.
              </p>
            </InsightBox>

            <InsightBox>
              <p className="text-neutral-300">
                <strong>The Trustless Robot Judge:</strong> The smart contract is a robot judge. It follows its rules exactly, every time, for everyone. No favoritism, no human error, no &quot;but I know the manager.&quot; The code is the law, and the law is the same for all participants.
              </p>
            </InsightBox>

            <InsightBox>
              <p className="text-neutral-300">
                <strong>The PDA as a Safe:</strong> Each escrow PDA is a safe. The client puts money in. Only the program has the combination. The program only opens it under exact conditions (client approves work, or client cancels before acceptance). Nobody else &mdash; not even the program&apos;s deployer &mdash; can extract funds outside these rules.
              </p>
            </InsightBox>

            <InsightBox>
              <p className="text-neutral-300">
                <strong>The CID as Fingerprint:</strong> Every IPFS CID is a fingerprint of the data. Change one byte &rarr; completely different fingerprint. You can verify data integrity just by checking if the fingerprint matches. When a CID is stored on-chain, it&apos;s an immutable commitment to specific data that existed at that moment.
              </p>
            </InsightBox>

            <InsightBox>
              <p className="text-neutral-300">
                <strong>The State Machine as a Board Game:</strong> The escrow has 6 possible states and strict rules about which moves are allowed from each state. Like chess &mdash; a pawn can only move forward, not backward. The blockchain enforces these rules with mathematical certainty.
              </p>
            </InsightBox>
          </Section>

          {/* Section 25 */}
          <Section id="s25" num={25} title="Reviewer Q&A &mdash; 50 Deep Questions Answered">
            <div className="space-y-6">
              {[
                { q: "How do you prevent double-spending?", a: "Solana processes transactions for a given account sequentially (single-threaded per account). The first transaction changes the state, and the second sees the new state. Combined with status checks in every instruction, double-spending is impossible. If two people try to accept the same escrow, the first succeeds and the second fails with InvalidStatus." },
                { q: "What happens if Solana goes down?", a: "Escrow funds are safe in the PDA. When the network recovers, all accounts resume their previous state. No data is lost. The app would show errors during downtime but work normally after recovery." },
                { q: "Can the program be upgraded to steal funds?", a: "The program authority (deployer) CAN upgrade the program. To make it immutable, the authority can be set to null after deployment. On mainnet, we would either revoke upgrade authority or transfer it to a multi-sig/DAO for governance." },
                { q: "How do you handle network congestion?", a: "We use 'confirmed' commitment and the wallet adapter handles retry logic. If a transaction doesn't land, the user sees an error and can retry. The idempotent nature of PDA derivation means retrying is safe — creating the same escrow twice is impossible (PDA already exists)." },
                { q: "What if IPFS data disappears?", a: "On-chain data (amount, status, client/freelancer addresses) is permanent and sufficient for the escrow to function. Only metadata (title, description, files) would be lost. The escrow can still be released/cancelled/disputed without metadata. Pinata pinning ensures persistence." },
                { q: "Why not use a multi-sig instead of escrow?", a: "Multi-sig requires BOTH parties to cooperate for any action. Our escrow allows unilateral actions: client can cancel if Open, freelancer can submit work, either can raise a dispute. Multi-sig would deadlock if one party disappears." },
                { q: "How do you handle the case where a freelancer never submits work?", a: "Currently, the client can raise a dispute (status changes to Disputed). A future improvement would add deadline-based auto-refund using Solana's Clock sysvar." },
                { q: "What prevents a client from never releasing funds after work is submitted?", a: "The freelancer can raise a dispute. Currently dispute resolution is off-chain. Future: add DAO-based arbitration or automatic release after a timeout period." },
                { q: "How is the escrow different from just sending SOL directly?", a: "Direct transfer is irreversible and trust-based. Escrow holds funds in a neutral PDA until conditions are met. The client can't take the money back after acceptance (protecting the freelancer), and the freelancer can't get paid until the client approves (protecting the client)." },
                { q: "What's your on-chain program size?", a: "The compiled BPF program is relatively small (< 200KB). Anchor generates efficient code. The deployed program account stores this bytecode and is immutable once upgrade authority is revoked." },
                { q: "How do you handle the escrow if both parties go inactive?", a: "Currently, the escrow sits in its current state indefinitely. The rent-exempt lamports keep the account alive forever. Future: add a timeout/expiry mechanism where funds return to the client after a configurable period." },
                { q: "Why store the IPFS CID on-chain instead of the metadata directly?", a: "On-chain storage costs ~0.00000348 SOL per byte. A 1KB metadata JSON would cost ~0.003 SOL in rent. An IPFS CID is ~60 bytes. Plus, IPFS content is immutable — the CID is a commitment to specific data, providing the same integrity guarantee at a fraction of the cost." },
                { q: "How do you handle wallet disconnection during a transaction?", a: "If the wallet disconnects before signing, signTransaction throws an error caught by our try/catch. If it disconnects after signing but before confirmation, the signed transaction is already in the mempool and will execute regardless. The user needs to reconnect and refresh to see the updated state." },
                { q: "What's the maximum escrow amount?", a: "u64 max = 18.4 billion SOL. Far exceeds total SOL supply (~570M). There's no practical upper limit." },
                { q: "Can someone create a fraudulent escrow to spam the network?", a: "Creating an escrow requires real SOL (for rent + deposit). Spam would cost money. Each escrow is isolated in its own PDA, so spam doesn't affect legitimate escrows." },
                { q: "Why Rust instead of Solidity for the smart contract?", a: "Solana's VM runs BPF bytecode, not EVM. Rust compiles to BPF. Rust also provides memory safety, zero-cost abstractions, and a rich type system that catches bugs at compile time." },
                { q: "How does the frontend know when an escrow state changes?", a: "Currently via polling — after each action, fetchAll() re-queries all escrows. For real-time updates, we could add WebSocket subscriptions via onAccountChange() to get push notifications when escrow accounts are modified." },
                { q: "What happens if two escrows are created with the same ID?", a: "Impossible. PDA derivation is deterministic — same seeds = same address. Anchor's init constraint checks if the account already exists. Second creation fails with 'account already in use'." },
                { q: "How do you verify the freelancer actually did the work?", a: "Multiple layers: (1) IPFS CID stored on-chain proves specific files were submitted at a specific time. (2) GitHub verification checks for real code, matching tech stack, and commit history. (3) Client manually reviews before releasing. It's trust-assisted, not trust-free." },
                { q: "What if the Helius RPC goes down?", a: "We have a fallback to the public Solana devnet RPC. The NETWORK constant uses process.env.NEXT_PUBLIC_HELIUS_RPC_URL with || 'https://api.devnet.solana.com' as fallback. Performance would degrade (rate limits) but functionality would continue." },
                { q: "Why is the program ID hardcoded?", a: "The program ID comes from the IDL file (idl.metadata.address = 'GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R'). It's determined at deployment time and never changes. Hardcoding it (via IDL) is standard practice — it's public information, not a secret." },
                { q: "How do you handle the case where lamports math causes underflow?", a: "Rust's try_borrow_mut_lamports returns a Result. If we tried to subtract more than the balance, the runtime would catch it. But our logic always subtracts escrow.amount which was deposited earlier, so underflow can't happen in a valid state." },
                { q: "What if someone sends extra SOL to the escrow PDA?", a: "The extra SOL stays in the PDA. Our release_funds only transfers escrow.amount, not the entire balance. The excess is effectively locked (unless we add a sweep instruction). This is a minor limitation." },
                { q: "Why use Date.now() for escrow IDs instead of a counter?", a: "On-chain counters require a separate account with sequential updates — a bottleneck. Date.now() gives millisecond-precision timestamps that are practically unique per client. The tiny collision risk (same client, same millisecond) is caught by init's account-exists check." },
                { q: "How does the escrow handle SOL price volatility?", a: "It doesn't — this is a known limitation. The escrow locks a specific SOL amount. If SOL drops 50% between creation and release, the freelancer gets less fiat value. Solution: support SPL tokens like USDC for price-stable escrows." },
                { q: "Why do you use BN.js instead of native BigInt?", a: "Anchor's TypeScript SDK and @solana/web3.js were built before native BigInt had wide browser support. The BN type from bn.js is deeply integrated into Anchor's serialization/deserialization. Mixing BigInt and BN causes type errors. So we use BN consistently throughout." },
                { q: "What if Pinata goes out of business?", a: "The IPFS CIDs are standard — any IPFS node can serve the same content. We'd migrate to another pinning service (Web3.Storage, Filebase, etc.) and re-pin the same CIDs. On-chain data is unaffected. The CIDs stored on-chain would still point to the same content on any IPFS gateway." },
                { q: "How do you test the smart contract?", a: "Anchor provides a testing framework using Mocha/TypeScript. Tests run against a local Solana validator (solana-test-validator). Each test creates accounts, calls instructions, and asserts state changes. We test happy paths and every error condition (wrong signer, wrong status, etc.)." },
                { q: "Why not store files directly on Solana?", a: "Solana's max account size is 10MB and rent for 10MB is ~0.07 SOL (~$10). For a 5MB PDF, that's $5 in storage alone. IPFS storage via Pinata is effectively free for our file sizes. Plus, Solana accounts are not designed for binary blob storage — they're for program state." },
                { q: "What happens if the user's browser crashes mid-upload?", a: "If the IPFS upload completed, the file is pinned on Pinata (safe). If the on-chain transaction was signed and sent, it's in the mempool and will execute. If neither completed, no state changed — user simply retries. Each step is independently safe." },
                { q: "How do you prevent a freelancer from submitting plagiarized work?", a: "We can't fully prevent it on-chain — that's a human judgment call. The GitHub verification checks for real code with commits (not just a fork), and the client reviews before releasing. The IPFS CID creates an immutable timestamp of exactly what was submitted." },
                { q: "Can you add milestone-based payments?", a: "Yes, architecturally. You'd add a milestones array to the escrow account, each with an amount and status. release_funds would release per-milestone amounts. This increases account size and complexity but is technically straightforward." },
                { q: "What's the difference between init and init_if_needed?", a: "init always creates a new account — fails if it exists. init_if_needed creates only if the account doesn't exist, otherwise uses the existing one. We use init because we always want a fresh escrow. init_if_needed would be dangerous here — it could let someone hijack an existing PDA." },
                { q: "How do Anchor events work under the hood?", a: "emit!() writes structured data to the transaction's log output using Solana's msg!() macro with a specific format. The data is prefixed with a discriminator (SHA-256 of 'event:EventName'). Frontend can parse these from transaction logs using program.addEventListener()." },
                { q: "Why is the freelancer field in ReleaseFunds an AccountInfo instead of Signer?", a: "The freelancer doesn't sign the release transaction — the CLIENT does. The freelancer is just the recipient of funds. Using AccountInfo (with /// CHECK comment) tells Anchor we'll verify it manually (via require!(freelancer.key() == escrow.freelancer)). The freelancer doesn't need to be online for release." },
                { q: "What's the Anchor 'space' calculation for our escrow?", a: "8 (discriminator) + 32 (client) + 32 (freelancer) + 8 (amount) + 1 (status enum) + 8 (escrow_id) + 8 (created_at) + (4+200)(description) + (4+200)(submission_cid) + 1 (bump) = 506 bytes. Anchor's InitSpace derive macro calculates this automatically from #[max_len(200)] annotations." },
                { q: "Why does the status enum use 1 byte, not 4?", a: "Borsh encodes enums with a 1-byte variant index (0-255). Since our EscrowStatus has only 6 variants (0-5), 1 byte is sufficient. This is more compact than Solidity's default 256-bit (32 byte) enum encoding." },
                { q: "Can the escrow handle NFTs or other tokens?", a: "Not currently — it only handles native SOL. Supporting SPL tokens (USDC, USDT, NFTs) would require associated token accounts, token program CPIs, and modified transfer logic. The state machine and PDA design would stay the same." },
                { q: "What if a malicious client creates an escrow with amount=1 lamport?", a: "The contract allows it (amount > 0 passes). It's economically irrational — the rent cost (~0.003 SOL) far exceeds the escrowed amount. The freelancer would see 1 lamport (~$0.00000015) and simply not accept. No harm done." },
                { q: "How does the fetchOpenEscrows function work without a status filter?", a: "We fetch ALL program accounts (with only the discriminator filter), then filter client-side for status == 'Open'. Solana doesn't support filtering on enum values via memcmp easily because the status byte (offset 80) would need exact byte comparison. Client-side filtering is simpler and the account count is manageable." },
                { q: "What's the risk of using 'confirmed' vs 'finalized' commitment?", a: "Confirmed has ~0.01% revert risk. In practice, this means roughly 1 in 10,000 confirmed transactions could theoretically revert during a network fork. For our use case (not handling millions of dollars per tx), this is acceptable. The user simply retries." },
                { q: "Why does createEscrow take receiver as Pubkey::default() for open escrows?", a: "Pubkey::default() is all zeros (0x000...000). It's a sentinel value meaning 'no specific receiver'. In accept_escrow, we check: if freelancer == Pubkey::default(), anyone can accept. This avoids needing an Option<Pubkey> which would add an extra byte and complexity." },
                { q: "How do you handle the case where getProgramAccounts returns thousands of results?", a: "We use memcmp filters to narrow results: only MY escrows (as client), or MY escrows (as freelancer). This dramatically reduces the result set. For open escrows, we fetch all and filter — but in production with thousands of escrows, we'd add pagination or indexing." },
                { q: "What is the bs58 import used for?", a: "bs58 encodes the Escrow account discriminator bytes into Base58 format for the memcmp filter. The RPC's memcmp.bytes field expects Base58-encoded data. We compute SHA-256('account:Escrow')[0..8] and Base58-encode it to create the filter value." },
                { q: "Could someone front-run an escrow acceptance by watching the mempool?", a: "Solana doesn't have a traditional mempool — transactions go directly to the current leader via Gulf Stream. The leader processes them FIFO. While a sophisticated attacker monitoring the leader's TPU could attempt to insert a transaction, the practical difficulty and low economic incentive (accepting a random escrow) make this a non-issue." },
                { q: "Why do escrow accounts persist after completion?", a: "We don't have a close_escrow instruction. Closing requires zeroing the account data and transferring all remaining lamports (including rent) to a recipient. Without this, completed/cancelled escrows stay on-chain permanently. The rent (~0.003 SOL) is locked. This is a known limitation listed for future improvement." },
                { q: "What security audit has the contract undergone?", a: "Currently none — this is a devnet project. Before mainnet deployment, we would engage a professional Solana audit firm (Neodyme, OtterSec, Halborn, etc.) to review the program. The contract is relatively simple (6 instructions, no complex math) which limits attack surface." },
                { q: "How does the IntersectionObserver-based scroll spy on this page work?", a: "Each section has a unique ID. On mount, we create an IntersectionObserver watching all section elements with rootMargin '-20% 0px -70% 0px'. When a section enters the top 20-30% of the viewport, its entry fires as intersecting, and we update activeSection state. The TOC highlights the corresponding item." },
                { q: "What happens to the EscrowCreated event data?", a: "Events are stored in the transaction logs on-chain permanently. Any indexer (Helius, Shyft, etc.) can parse these logs. Our frontend doesn't currently listen to events — we use direct account fetching. Events would be useful for building a notification system or activity feed." },
              ].map(({ q, a }, i) => (
                <div key={i} className="border border-neutral-800 rounded-lg p-4">
                  <p className="text-white font-semibold mb-2">Q{i + 1}: {q}</p>
                  <p className="text-neutral-400 text-sm">{a}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ==================== PART VI ==================== */}
          <PartHeader title="Part VI: Comparisons & Context" subtitle="How Trustify fits in the bigger picture" />

          {/* Section 26 */}
          <Section id="s26" num={26} title="Trustify vs Everything Else">
            <Table
              headers={["Feature", "Trustify", "PayPal", "Escrow.com", "ETH Escrow", "Multi-sig"]}
              rows={[
                ["Fees", "$0.45 fixed", "2.9% + $0.30", "3.25%", "$5-50/tx", "Gas per signer"],
                ["Speed", "~12 sec finality", "Instant to 3 days", "1-5 business days", "15 min finality", "15+ min"],
                ["Global access", "Anyone with internet", "Restricted countries", "Restricted", "Anyone", "Anyone"],
                ["KYC required", "No", "Yes", "Yes", "No", "No"],
                ["File attachments", "Yes (IPFS)", "Messages only", "Documents", "Custom", "No"],
                ["Code verification", "GitHub integration", "No", "No", "No", "No"],
                ["Programmable", "Fully (Rust/Anchor)", "No", "No", "Yes (Solidity)", "Limited"],
                ["Dispute resolution", "On-chain flag + off-chain", "PayPal decides", "Escrow.com decides", "Custom", "Consensus"],
                ["Transparency", "Fully on-chain", "None", "Some", "Fully on-chain", "On-chain"],
                ["Min transaction", "No minimum", "$1", "$500", "Gas makes small txs impractical", "Gas-dependent"],
              ]}
            />
          </Section>

          {/* Section 27 */}
          <Section id="s27" num={27} title="The Full Tech Stack &mdash; Every Dependency">
            <Sub>Core Framework</Sub>
            <Table
              headers={["Package", "What It Does", "Why We Need It"]}
              rows={[
                ["next (15.x)", "React framework with SSR, API routes, file-based routing", "Foundation of the entire frontend + serverless API endpoints"],
                ["react (19)", "UI component library", "Declarative UI with hooks, concurrent rendering"],
                ["react-dom (19)", "React DOM renderer", "Required peer dependency for React web apps"],
                ["typescript (5)", "Static type checking", "Catches type errors at compile time (Pubkey vs string, BN vs number)"],
              ]}
            />

            <Sub>Blockchain</Sub>
            <Table
              headers={["Package", "What It Does", "Why We Need It"]}
              rows={[
                ["@solana/web3.js", "Low-level Solana SDK", "Connection, Transaction, PublicKey, SystemProgram, LAMPORTS_PER_SOL"],
                ["@project-serum/anchor", "High-level program interaction", "Program, AnchorProvider, BN, IDL parsing, account deserialization"],
                ["@solana/wallet-adapter-base", "Wallet adapter base types", "WalletAdapter interface, WalletError types"],
                ["@solana/wallet-adapter-react", "React hooks for wallets", "useWallet, useConnection, WalletProvider"],
                ["@solana/wallet-adapter-react-ui", "Pre-built wallet UI", "WalletMultiButton, WalletModalProvider, connect/disconnect modal"],
              ]}
            />

            <Sub>UI Components (Radix UI)</Sub>
            <Table
              headers={["Package", "Usage"]}
              rows={[
                ["@radix-ui/react-dialog", "Escrow detail modal, submission dialog"],
                ["@radix-ui/react-tabs", "Dashboard tabs (My Escrows, Receivable, Open)"],
                ["@radix-ui/react-select", "Status filter dropdown"],
                ["@radix-ui/react-accordion", "Expandable sections in forms"],
                ["@radix-ui/react-checkbox", "Requirements checklist in submissions"],
                ["@radix-ui/react-progress", "Upload progress, verification progress"],
                ["@radix-ui/react-label", "Accessible form labels"],
                ["@radix-ui/react-separator", "Visual dividers"],
                ["@radix-ui/react-switch", "Toggle switches (open/directed mode)"],
                ["@radix-ui/react-alert-dialog", "Confirmation dialogs (cancel, dispute)"],
                ["@radix-ui/react-dropdown-menu", "Context menus, action menus"],
                ["@radix-ui/react-avatar", "User wallet avatars"],
                ["@radix-ui/react-slot", "Polymorphic component rendering (Slot pattern)"],
                ["@radix-ui/react-collapsible", "Collapsible sections"],
                ["@radix-ui/react-slider", "Amount slider input"],
                ["@radix-ui/react-toggle / toggle-group", "Filter toggles"],
              ]}
            />

            <Sub>Styling & Animation</Sub>
            <Table
              headers={["Package", "What It Does"]}
              rows={[
                ["tailwindcss (3.4)", "Utility-first CSS framework, dark theme, responsive"],
                ["tailwind-merge", "Smart class merging — prevents 'bg-red bg-blue' conflicts"],
                ["clsx", "Conditional class concatenation — cn() utility"],
                ["class-variance-authority", "Type-safe component variants (Button sizes, colors)"],
                ["tailwindcss-animate", "Animation utilities (fade-in, slide-in, etc.)"],
                ["framer-motion (11)", "Declarative React animations, layout transitions"],
                ["next-themes", "Theme provider (dark mode)"],
              ]}
            />

            <Sub>Utilities</Sub>
            <Table
              headers={["Package", "What It Does"]}
              rows={[
                ["cmdk", "Command palette (Cmd+K) component"],
                ["vaul", "Drawer component for mobile"],
                ["input-otp", "OTP input component"],
                ["lucide-react", "Tree-shakeable icon library (1000+ icons)"],
                ["autoprefixer", "PostCSS plugin for vendor prefixes"],
              ]}
            />
          </Section>

          {/* Section 28 */}
          <Section id="s28" num={28} title="Environment Variables &mdash; Every Config Explained">
            <Table
              headers={["Variable", "Prefix", "Where Used", "Purpose"]}
              rows={[
                ["NEXT_PUBLIC_HELIUS_RPC_URL", "NEXT_PUBLIC_", "Browser + Server", "Helius RPC endpoint. Public prefix = available in browser JS. Falls back to api.devnet.solana.com"],
                ["PINATA_JWT", "(none)", "Server only", "Pinata API JWT for file uploads. No NEXT_PUBLIC_ prefix = never exposed to browser. Generated from Pinata dashboard → API Keys"],
                ["NEXT_PUBLIC_PINATA_GATEWAY", "NEXT_PUBLIC_", "Browser + Server", "Custom Pinata gateway domain for faster CDN reads. Falls back to gateway.pinata.cloud"],
                ["GITHUB_TOKEN", "(none)", "Server only", "Optional GitHub personal access token. Without: 60 req/hr. With: 5,000 req/hr. Set for production"],
              ]}
            />

            <WhyBox>
              <p className="text-neutral-300">
                The <InlineCode>NEXT_PUBLIC_</InlineCode> prefix is a Next.js convention. Variables with this prefix are embedded into the JavaScript bundle at build time and are visible to anyone who views the page source. Never put secrets (JWT, API keys) in NEXT_PUBLIC_ variables. That&apos;s why PINATA_JWT and GITHUB_TOKEN have no prefix &mdash; they&apos;re only accessible in server-side code (API routes).
              </p>
            </WhyBox>
          </Section>

          {/* ==================== PART VII ==================== */}
          <PartHeader title="Part VII: Reference" subtitle="Quick-access tables for everything" />

          {/* Section 29 */}
          <Section id="s29" num={29} title="Edge Cases & Error Handling Master List">
            <Sub>On-Chain Errors (10 codes)</Sub>
            <Table
              headers={["Code", "Name", "Scenario", "User Impact"]}
              rows={[
                ["6000", "InvalidAmount", "create_escrow(amount=0)", "Form validation should prevent. If bypassed, tx rejected."],
                ["6001", "DescriptionTooLong", "description > 200 chars", "Form limits input. IPFS CIDs are ~60 chars."],
                ["6002", "InvalidStatus", "Wrong state for action (e.g., accept a Completed escrow)", "Button disabled for invalid states. Race conditions caught."],
                ["6003", "ClientCannotBeFreelancer", "Self-dealing attempt", "UI prevents setting self as receiver."],
                ["6004", "UnauthorizedFreelancer", "Non-freelancer calls submit_work", "Only shown to assigned freelancer."],
                ["6005", "UnauthorizedClient", "Non-client calls release/cancel", "Button only visible to client."],
                ["6006", "InvalidFreelancer", "Freelancer address mismatch in release", "Frontend passes correct freelancer from escrow data."],
                ["6007", "CannotCancelInProgress", "Cancel after acceptance", "Cancel button hidden after acceptance."],
                ["6008", "UnauthorizedCaller", "Non-participant disputes", "Dispute button only for client/freelancer."],
                ["6009", "EmptySubmissionCid", "Empty CID in submit_work", "Form validation requires CID."],
              ]}
            />

            <Sub>RPC Failure Modes</Sub>
            <Table
              headers={["Failure", "Cause", "Impact", "Handling"]}
              rows={[
                ["Timeout", "RPC node overloaded or network issue", "Request hangs until browser timeout (~30s)", "User sees loading spinner, can retry"],
                ["429 Rate Limited", "Too many requests", "Request rejected", "Helius has higher limits. Fallback RPC is lower."],
                ["Stale data", "confirmed commitment is 1-2 slots behind", "Slight delay in seeing new escrows", "Acceptable for escrow operations"],
                ["Dropped transaction", "Leader didn't include in block", "Tx never executes", "User doesn't see change, retries safely (PDA idempotent)"],
              ]}
            />

            <Sub>IPFS Failure Modes</Sub>
            <Table
              headers={["Failure", "Impact", "Handling"]}
              rows={[
                ["Gateway down", "Can't load metadata/files", "Escrow still functional (on-chain data sufficient), show fallback UI"],
                ["Invalid CID format", "isIpfsCid() returns false", "extractCid() returns null, escrow shows raw description"],
                ["Slow fetch (> 10s)", "AbortSignal.timeout triggers", "Return null, show escrow without metadata"],
                ["Corrupted JSON", "res.json() throws", "Catch block returns null, graceful degradation"],
              ]}
            />

            <Sub>Wallet Failure Modes</Sub>
            <Table
              headers={["Failure", "Cause", "Handling"]}
              rows={[
                ["User rejected", "Clicked 'Reject' in wallet popup", "Error caught, toast shown, no state change"],
                ["Wallet disconnected", "Extension closed or network change", "publicKey becomes null, redirect to connect"],
                ["Wrong network", "Mainnet wallet on devnet app", "Transaction fails with invalid blockhash error"],
                ["Insufficient balance", "Not enough SOL for rent + amount + fee", "System Program InsufficientFunds before our code runs"],
              ]}
            />

            <Sub>Frontend Edge Cases</Sub>
            <Table
              headers={["Scenario", "What Happens", "Handling"]}
              rows={[
                ["Browser refresh during tx", "Signed tx is in mempool, will execute", "User refreshes, sees updated state"],
                ["Two tabs open", "Each tab has own state, no sync", "Both tabs call fetchAll independently, eventual consistency"],
                ["Cache staleness after action", "onAction triggers fetchAll for fresh data", "Full re-fetch from RPC ensures current state"],
                ["Escrow appears in multiple queries", "Same escrow in client + open results", "Deduplication by publicKey in the dashboard"],
              ]}
            />
          </Section>

          {/* Section 30 */}
          <Section id="s30" num={30} title="Glossary &mdash; Every Term Defined">
            <div className="grid gap-3">
              {[
                ["PDA (Program Derived Address)", "A deterministic address derived from seeds + program ID that has no private key. Only the program can authorize operations. Used for escrow vaults."],
                ["Lamport", "Smallest unit of SOL. 1 SOL = 1,000,000,000 lamports. Named after Leslie Lamport. All on-chain math uses lamports."],
                ["CID (Content Identifier)", "IPFS address that is a cryptographic hash of the content. Same content = same CID. Change content = different CID. Immutable by nature."],
                ["Borsh", "Binary Object Representation Serializer for Hashing. Deterministic binary encoding used by Solana/Anchor. No field names stored, compact, fast."],
                ["Discriminator", "First 8 bytes of an Anchor account. SHA-256('account:TypeName')[0..8]. Used to identify account types and filter in getProgramAccounts."],
                ["Memcmp", "Memory compare filter for getProgramAccounts. Checks bytes at a specific offset match expected value. How we find escrows by client/freelancer."],
                ["Commitment", "How confirmed a transaction is. processed (local) < confirmed (66%+ validators) < finalized (31+ slots). We use confirmed."],
                ["Rent-exemption", "Minimum lamport balance to keep an account alive permanently. Below threshold = account deleted by runtime. ~0.00089 SOL per 100 bytes."],
                ["IDL (Interface Definition Language)", "JSON file generated by Anchor describing all instructions, accounts, types, and errors. Frontend uses it to interact with the program."],
                ["Bump Seed", "The byte (0-255) appended to PDA seeds that makes the hash land off the ed25519 curve. Stored in the account to avoid recomputation."],
                ["Signer", "An account that provided a valid ed25519 signature for the transaction. Anchor's Signer<'info> type enforces this."],
                ["BPF (Berkeley Packet Filter)", "The virtual machine that runs Solana programs. Sandboxed — programs can only access passed accounts. No I/O or network access."],
                ["AnchorProvider", "Combines a Connection (RPC) and a Wallet (signer) into a single object that the Program uses to build and send transactions."],
                ["BN (Big Number)", "JavaScript library for arbitrary-precision integers. Required because u64 exceeds JavaScript's Number.MAX_SAFE_INTEGER (2^53 - 1)."],
                ["Base58", "Encoding that converts binary data to human-readable text using 58 characters (no 0, O, l, I, +, /). Used for Solana addresses."],
                ["SHA-256", "Cryptographic hash function producing 256-bit output. Used in PoH chain, Merkle trees, PDA derivation, and discriminator generation."],
                ["ed25519", "Elliptic curve used for Solana's digital signatures. Fast, constant-time, deterministic, 32-byte keys, 64-byte signatures."],
                ["PoH (Proof of History)", "Solana's innovation — a SHA-256 hash chain that creates a verifiable passage of time without validator communication."],
                ["PoS (Proof of Stake)", "Consensus where validators lock tokens as collateral. Solana uses PoS for validator selection combined with PoH for ordering."],
                ["RPC (Remote Procedure Call)", "Protocol for the frontend to communicate with blockchain nodes. JSON-RPC over HTTP. Methods: sendTransaction, getBalance, etc."],
                ["JSON-RPC", "The specific RPC protocol used by Solana. Request: {jsonrpc, method, params, id}. Response: {jsonrpc, result, id}. Standard and language-agnostic."],
                ["IPFS (InterPlanetary File System)", "Distributed file system where files are addressed by their content hash (CID). Decentralized, immutable, content-addressable."],
                ["Pinning", "Telling an IPFS node to permanently store specific content. Without pinning, content is garbage-collected after cache eviction."],
                ["Gateway", "HTTP endpoint that serves IPFS content. E.g., gateway.pinata.cloud/ipfs/{CID}. Bridges traditional web to IPFS network."],
                ["DAG (Directed Acyclic Graph)", "Data structure where nodes point to other nodes with no cycles. IPFS uses DAGs to represent file chunks and directory structures."],
                ["DHT (Distributed Hash Table)", "Decentralized lookup system. IPFS uses DHT to find which nodes store a given CID without a central server."],
                ["Merkle Tree", "Binary tree of hashes. Used to efficiently prove data membership. Leaf nodes = data hashes. Root = single hash summarizing everything."],
                ["CPI (Cross-Program Invocation)", "One program calling another. Our create_escrow uses CPI to call system_program::transfer to move SOL from client to PDA."],
                ["Account", "Solana's fundamental data unit. Has an owner (program), lamport balance, and data field. Everything on Solana is an account."],
                ["Program", "Executable code deployed to Solana. Stored in an account. Stateless — all state lives in other accounts passed to instructions."],
                ["Instruction", "A single operation in a transaction. Contains: program to call, accounts to pass, and serialized arguments."],
                ["Blockhash", "Hash of a recent block. Included in transactions to prevent replay attacks. Valid for ~90 seconds (~150 slots)."],
                ["Compute Units", "Solana's gas equivalent. Each instruction consumes CU. Default limit: 200K per tx. Max: 1.4M with explicit request."],
                ["Sealevel", "Solana's parallel transaction execution engine. Non-conflicting transactions run simultaneously across CPU cores."],
                ["Gulf Stream", "Solana's mempool-less transaction forwarding. Transactions sent directly to the expected next leader, reducing latency."],
                ["Turbine", "Solana's block propagation protocol. Splits blocks into smaller packets and distributes them like BitTorrent."],
                ["Cloudbreak", "Solana's horizontally-scaled account database. Uses memory-mapped files for fast random access to account state."],
                ["Finality", "When a transaction is irreversible. Solana: confirmed (~400ms, 0.01% revert risk) or finalized (~12s, 0% revert risk)."],
                ["Devnet", "Solana's test network. Free SOL via airdrop. Used for development and testing. Our current deployment target."],
                ["Mainnet", "Solana's production network. Real SOL with real value. Requires thorough testing and audit before deployment."],
                ["Airdrop", "Free SOL distribution on devnet/testnet for development. connection.requestAirdrop(pubkey, amount). Not available on mainnet."],
                ["Explorer", "Web UI for viewing transactions and accounts. explorer.solana.com. We generate explorer URLs for every transaction."],
                ["Transaction Signature", "The unique 88-character base58 string identifying a transaction. Returned after successful submission. Used for explorer links."],
                ["Anchor Events", "On-chain logs emitted via emit!() macro. Contain structured data about what happened. Can be parsed by frontends for real-time updates."],
                ["InitSpace", "Anchor derive macro that calculates the space needed for an account struct. Accounts for all field sizes including Borsh overhead."],
                ["Rent", "The per-byte cost of storing data on Solana. Accounts below rent-exempt threshold are deleted. Most accounts are made rent-exempt at creation."],
                ["Slot", "Solana's basic time unit. Each slot is ~400ms. A leader produces one block per slot. 150 slots ≈ 1 minute."],
                ["Epoch", "A period of ~2-3 days on Solana during which a fixed set of validators is active. Leader schedule is determined per epoch."],
                ["Validator", "A node that participates in Solana consensus. Validates transactions, votes on blocks, and earns rewards. Requires staked SOL."],
                ["Wallet Adapter", "Solana's standard library for connecting web apps to browser wallets (Phantom, Solflare, etc.). Handles detection, connection, and signing."],
                ["SPL Token", "Solana Program Library Token — the standard for fungible and non-fungible tokens on Solana (like ERC-20 on Ethereum). USDC, USDT are SPL tokens."],
                ["Associated Token Account", "A deterministic token account derived from a wallet address + token mint. Ensures each wallet has exactly one account per token type."],
                ["System Program", "Solana's built-in program (address: 11111111111111111111111111111111) that handles account creation, SOL transfers, and account allocation."],
                ["Clock Sysvar", "A special Solana account containing the current slot, epoch, and Unix timestamp. Programs read it via Clock::get()? for time-based logic."],
                ["Mempool", "A holding area for unconfirmed transactions. Solana's Gulf Stream mostly eliminates the mempool by forwarding txs directly to the expected leader."],
                ["MEV (Miner Extractable Value)", "Profit extracted by reordering/inserting transactions. Common on Ethereum. Much harder on Solana due to FIFO processing and lack of traditional mempool."],
                ["Idempotent", "An operation that produces the same result regardless of how many times it's applied. PDA creation is idempotent — same seeds always derive same address."],
                ["Deterministic", "Always produces the same output for the same input. PDA derivation, Borsh serialization, and SHA-256 are all deterministic."],
                ["Sentinel Value", "A special value that indicates 'none' or 'not set'. We use Pubkey::default() (all zeros) as a sentinel for 'no freelancer assigned'."],
                ["Toast", "A small notification that briefly appears on screen. Used in our frontend to show transaction success/failure messages after escrow actions."],
                ["Turbopack", "Next.js's Rust-based bundler (successor to Webpack). We use it in dev mode via 'next dev --turbopack' for faster hot module replacement."],
              ].map(([term, def], i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-neutral-800/50 last:border-0">
                  <span className="text-purple-400 font-mono text-sm font-semibold whitespace-nowrap shrink-0">{term}</span>
                  <span className="text-neutral-400 text-sm">{def}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ==================== PART VIII ==================== */}
          <PartHeader title="Part VIII: The Kid-Friendly Guide" subtitle="Every algorithm and concept explained so simply a 5-year-old gets it" />

          {/* Section 31 */}
          <Section id="s31" num={31} title="How Trustify Works &mdash; The Simple Story">
            <p>
              Imagine Ravi wants to hire Priya to draw a picture for him. But they don&apos;t trust each other:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Ravi is scared: &quot;What if I pay and Priya never draws?&quot;</li>
              <li>Priya is scared: &quot;What if I draw and Ravi never pays?&quot;</li>
            </ul>
            <p>
              So they use Trustify &mdash; a <strong>robot teacher</strong> that both of them trust.
            </p>
            <Diagram>{`Step 1: Ravi gives his money to the Robot Teacher
         Ravi's wallet: 10 SOL → 9 SOL
         Robot's locker: 0 SOL → 1 SOL       "I'll hold this safely!"

Step 2: Priya sees the job and says "I'll do it!"
         Robot writes down: "Priya is the artist now"

Step 3: Priya draws the picture and shows proof
         Robot writes down: "Priya submitted her work"

Step 4: Ravi looks at the picture and says "Looks great!"
         Robot opens the locker and gives Priya the money:
         Robot's locker: 1 SOL → 0 SOL
         Priya's wallet: 5 SOL → 6 SOL       "Here you go, Priya!"

Everyone is happy. Nobody got cheated.`}</Diagram>
            <InsightBox>
              <p className="text-neutral-300">
                The &quot;Robot Teacher&quot; is our <strong>smart contract</strong> on Solana. The &quot;locker&quot; is a <strong>PDA</strong> (Program Derived Address). Nobody has the key to the locker &mdash; not Ravi, not Priya, not even the people who built the robot. Only the robot&apos;s rules can open it.
              </p>
            </InsightBox>

            <Sub>What If Something Goes Wrong?</Sub>
            <Diagram>{`What if Priya never does the work?
  → Ravi clicks "Cancel" → Robot gives money back to Ravi
    (But ONLY if Priya hasn't started yet!)

What if Priya does the work but Ravi won't pay?
  → Priya clicks "Dispute" → A grown-up (arbitrator) helps decide

What if Ravi tries to cancel AFTER Priya started working?
  → Robot says "NO! Priya already started. You can't take the money back."
    (This protects workers from unfair bosses)`}</Diagram>
          </Section>

          {/* Section 32 */}
          <Section id="s32" num={32} title="The Magic Fingerprint Machine (SHA-256)">
            <p>
              Imagine you have a magic machine. You put ANYTHING into it &mdash; a word, a picture, a whole book &mdash; and it spits out a <strong>fingerprint</strong>. A unique code that&apos;s always exactly 64 characters long.
            </p>
            <Code>{`Put in: "Hello"     → 185f8db32271fe25f561a6fc938b2e264...
Put in: "Hello!"    → 334d016f755cd6dc58c53a86e183882f4...
Put in: "hello"     → 2cf24dba5fb0a30e26e83b2ac5b9e29e1...

Change just ONE tiny thing → completely different fingerprint!`}</Code>

            <Sub>3 Rules of the Magic Machine</Sub>
            <div className="space-y-4">
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">Rule 1: Same input = same fingerprint, ALWAYS</p>
                <p className="text-neutral-400 text-sm mt-1">Put &quot;Hello&quot; in a million times and you get the exact same code every single time. Like how your real fingerprint never changes.</p>
              </div>
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">Rule 2: Can&apos;t go backwards (one-way door)</p>
                <p className="text-neutral-400 text-sm mt-1">If someone gives you the fingerprint, you CANNOT figure out what was put in. It&apos;s like a door you can only walk through in one direction.</p>
              </div>
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">Rule 3: No twins (collision-resistant)</p>
                <p className="text-neutral-400 text-sm mt-1">It&apos;s practically impossible for two different inputs to give the same fingerprint. In the entire history of SHA-256, nobody has EVER found two different inputs with the same output.</p>
              </div>
            </div>

            <Sub>Where We Use It in Trustify</Sub>
            <Diagram>{`1. CREATING THE LOCKER ADDRESS (PDA)
   SHA-256("escrow" + Ravi's wallet + job number) → Locker #4521
   Same Ravi + same job = same locker. Every time. No randomness.

2. ACCOUNT LABELS (Discriminator)
   SHA-256("account:Escrow") → take first 8 bytes → [55, 167, 209...]
   Like a sticker on the locker: "This is an ESCROW locker, not something else"

3. FILE FINGERPRINTS (IPFS CIDs)
   SHA-256(file contents) → becomes the file's address
   Change one word? Different fingerprint. PROVES nobody tampered.

4. SOLANA'S CLOCK (Proof of History)
   SHA-256 running non-stop, millions of times per second
   Creates an uncheatble timeline for every transaction`}</Diagram>

            <Sub>Why SHA-256 Specifically?</Sub>
            <Table
              headers={["Feature", "SHA-256"]}
              rows={[
                ["Speed", "Fast enough for 65,000 transactions/second"],
                ["Security", "Would take all computers on Earth billions of years to crack"],
                ["Output size", "256 bits (32 bytes) — small enough to store cheaply"],
                ["Track record", "Used since 2001 by Bitcoin, Solana, and the entire internet (HTTPS)"],
                ["Collisions found", "ZERO. Ever. In 25 years."],
              ]}
            />
            <InsightBox>
              <p className="text-neutral-300">
                SHA-256 is the <strong>trust machine</strong>. Our entire product &mdash; locker addresses, account labels, file integrity, time ordering &mdash; is built on this one guarantee: <em>same input = same output, always, and you can&apos;t fake it</em>.
              </p>
            </InsightBox>
          </Section>

          {/* Section 33 */}
          <Section id="s33" num={33} title="The Unstoppable Clock (Proof of History)">
            <Sub>The Problem: Nobody Has a Shared Clock</Sub>
            <p>
              Imagine 10 kids in different rooms, each writing a diary. They all write events but nobody has a clock. Now someone asks: &quot;Did Ravi submit his homework BEFORE or AFTER Priya?&quot; Nobody knows. There&apos;s no shared clock.
            </p>
            <p>
              This is the exact problem with blockchains &mdash; thousands of computers around the world need to agree on <strong>what happened first</strong>.
            </p>

            <Sub>How Bitcoin Solves It (The Slow Way)</Sub>
            <p>
              Bitcoin says: &quot;Everyone, solve this really hard math puzzle. Whoever solves it first gets to write the next page.&quot; This works but:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Wastes massive electricity</li>
              <li>Takes <strong>10 minutes</strong> per page (block)</li>
              <li>Only ~7 transactions per second</li>
            </ul>

            <Sub>How Solana Solves It (Proof of History)</Sub>
            <p>
              Solana&apos;s founder had a clever idea: <strong>what if we made a stopwatch using SHA-256?</strong>
            </p>
            <Code>{`Start:  hash_1 = SHA-256("start")
        hash_2 = SHA-256(hash_1)
        hash_3 = SHA-256(hash_2)
        hash_4 = SHA-256(hash_3)
        ...running non-stop, millions per second...`}</Code>

            <Sub>Why This Is a Clock</Sub>
            <p>
              The key insight: <strong>you CANNOT skip ahead.</strong>
            </p>
            <Diagram>{`To get hash_1000, you MUST compute:
  hash_1, then hash_2, then hash_3, ... ALL the way to hash_1000

There's no shortcut. No cheat code. No "jump to hash_1000."
Each hash is PROOF that real time passed to compute it.

It's like a magic notebook:
  • Page 2 can ONLY exist after page 1
  • Page 100 can ONLY exist after pages 1 through 99
  • Anyone can check that all pages are in order (fast to verify)`}</Diagram>

            <Sub>How Transactions Fit In</Sub>
            <Diagram>{`The PoH chain is running non-stop...

  hash_400000 = SHA-256(hash_399999)
  hash_400001 = SHA-256(hash_400000)
     ↑
     └── Ravi's escrow creation STAMPED HERE
  hash_400002 = SHA-256(hash_400001)
  hash_400003 = SHA-256(hash_400002)
     ↑
     └── Priya's acceptance STAMPED HERE
  hash_400004 = SHA-256(hash_400003)

Now EVERYONE knows: Ravi came BEFORE Priya.
It's baked into the hash chain. Can't rearrange. Can't lie.`}</Diagram>

            <Sub>The Stamp Machine Analogy</Sub>
            <p>
              Imagine a teacher has a special stamp machine:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>The machine stamps <InlineCode>STAMP #1</InlineCode>, then <InlineCode>STAMP #2</InlineCode>, then <InlineCode>STAMP #3</InlineCode>...</li>
              <li>Each stamp can ONLY come after the previous one</li>
              <li>When Ravi turns in homework, teacher stamps it &rarr; <strong>STAMP #4521</strong></li>
              <li>When Priya turns in homework, teacher stamps it &rarr; <strong>STAMP #4523</strong></li>
              <li>Now everyone knows: Ravi was first. No argument. No debate.</li>
              <li>Any student can count the stamps and verify the order</li>
            </ul>
            <p>That stamp machine = <strong>Proof of History</strong></p>

            <Sub>Why This Makes Solana So Fast</Sub>
            <Diagram>{`WITHOUT Proof of History (Bitcoin, Ethereum):
  Transaction arrives → Validators ask each other "What order?"
  → Everyone debates and votes → Eventually they agree → Block written
  All that TALKING takes time → 10 min (Bitcoin) / 12 sec (Ethereum)

WITH Proof of History (Solana):
  Transaction arrives → Validator stamps it into the PoH chain → Done!
  → Other validators verify (just recompute hashes — fast!)
  No debate needed → 400ms blocks → 65,000 transactions per second`}</Diagram>

            <Sub>Why This Matters for Trustify</Sub>
            <EdgeBox>
              <p className="text-neutral-300">
                <strong>Two freelancers try to accept the same escrow at the exact same moment:</strong> Without PoH, validators would argue about who was first. With PoH: Freelancer A gets stamped at hash_N, Freelancer B gets stamped at hash_N+2. A was first. Period. B gets an &quot;InvalidStatus&quot; error. No debate, no frontrunning, no unfairness.
              </p>
            </EdgeBox>
          </Section>

          {/* Section 34 */}
          <Section id="s34" num={34} title="The Magical Locker (PDA &mdash; Program Derived Address)">
            <Sub>Normal Wallet = Your Piggy Bank at Home</Sub>
            <p>
              You have a piggy bank. You have the key. You can open it anytime and take money out. That&apos;s a normal Solana wallet &mdash; you have the private key, you control the money.
            </p>

            <Sub>PDA = A Magical School Locker</Sub>
            <p>
              Imagine your school has a special locker. Here&apos;s what makes it magical:
            </p>
            <div className="space-y-3">
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">1. Nobody has the key</p>
                <p className="text-neutral-400 text-sm mt-1">Not you, not your friend, not even the teacher. The key literally doesn&apos;t exist. Mathematically impossible. (The address is &quot;off the curve&quot; &mdash; no private key can correspond to it.)</p>
              </div>
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">2. Only the school&apos;s Rule Book can open it</p>
                <p className="text-neutral-400 text-sm mt-1">The &quot;Rule Book&quot; is our smart contract. It says: &quot;Only open for Ravi IF no one accepted yet (cancel).&quot; &quot;Only open for Priya IF Ravi says work is done (release).&quot;</p>
              </div>
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">3. The locker number comes from a magic formula</p>
                <p className="text-neutral-400 text-sm mt-1">Put in &quot;escrow&quot; + your name + a number &rarr; always gives the SAME locker number. No randomness. Totally predictable.</p>
              </div>
            </div>

            <Sub>The Formula</Sub>
            <Code>{`Ingredients:
  "escrow"         (a constant word — like a secret recipe name)
  + Ravi's wallet  (32 bytes — Ravi's unique identity)
  + Job #12345     (8 bytes — the escrow ID)

Stir them together with SHA-256...

Result: Locker address = 7xKp9...mZ3R (a Solana address)

Same Ravi + same job number = same locker. EVERY TIME.
Different person = different locker.
Different job number = different locker.`}</Code>

            <Sub>The &quot;Off the Curve&quot; Magic</Sub>
            <Diagram>{`Normal wallet addresses sit ON the ed25519 elliptic curve:
  → For every point ON the curve, a private key EXISTS
  → If our locker landed on the curve, someone could find the key = BAD

PDA addresses are OFF the curve:
  → SHA-256(seeds) lands off the curve
  → No private key can possibly exist
  → ONLY our smart contract code can move the money

How we ensure "off curve":
  1. Try bump = 255, compute SHA-256(seeds + bump)
  2. Is it on the curve? YES → try bump = 254
  3. Is it on the curve? NO → SAFE! Use this address.
  4. Store the bump (usually 253-255) so we don't recalculate`}</Diagram>

            <InsightBox>
              <p className="text-neutral-300">
                This is why Trustify is trustless. Even the developers who built the app CANNOT steal money from a PDA. There is no secret backdoor. The math guarantees it. The only way money moves is through the smart contract&apos;s rules.
              </p>
            </InsightBox>
          </Section>

          {/* Section 35 */}
          <Section id="s35" num={35} title="The Avalanche Effect">
            <p>
              The avalanche effect is one of the most beautiful properties in cryptography. Change <strong>one tiny bit</strong> of the input, and the output changes <strong>completely and unpredictably</strong>. Like flicking one domino and watching the entire room collapse into a totally different pattern.
            </p>

            <Code>{`Input: "Hello World"
SHA-256: a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e

Input: "Hello World!"   (just added an exclamation mark!)
SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069

Input: "Hello world"    (just changed W to lowercase w!)
SHA-256: 64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c

Every single character of the output is different!
You CANNOT predict how the output will change.`}</Code>

            <Sub>Why This Matters</Sub>
            <Diagram>{`In a blockchain, each block contains the previous block's hash:

Block 1: data="Alice pays Bob $10"    hash=a591a6...
Block 2: data="Bob pays Carol $5"     prev_hash=a591a6...  hash=7f83b1...
Block 3: data="Carol pays Dave $3"    prev_hash=7f83b1...  hash=64ec88...

Now a hacker tries to change Block 1 ("Alice pays Bob $10" → "$0"):

Block 1: data="Alice pays Bob $0"     hash=????????  ← COMPLETELY DIFFERENT!
Block 2: prev_hash=a591a6... ← DOESN'T MATCH Block 1's new hash!
Block 3: prev_hash=7f83b1... ← DOESN'T MATCH Block 2's new hash!

ONE change broke EVERYTHING after it = AVALANCHE EFFECT
The hacker would need to recompute EVERY block after the change.
On Solana, that means outrunning thousands of validators.
Mathematically impossible.`}</Diagram>

            <Sub>Real-World Analogy</Sub>
            <p>
              Imagine a chain of 1000 padlocks, where each lock&apos;s combination is based on the previous lock. If you change lock #1&apos;s combination, every lock after it has the wrong combination. You&apos;d need to break and re-set all 999 remaining locks before anyone notices. But new locks are being added every 400 milliseconds. You can never catch up.
            </p>

            <Sub>Where the Avalanche Effect Protects Trustify</Sub>
            <Table
              headers={["Where", "What It Protects"]}
              rows={[
                ["Block chain", "Can't change past transactions (escrow creation, payments)"],
                ["IPFS CIDs", "Can't tamper with submitted work files — hash changes = different CID"],
                ["PDA addresses", "Can't guess or forge locker addresses — different seeds = totally different address"],
                ["Discriminators", "Can't confuse account types — one byte off = completely different 8-byte label"],
                ["Proof of History", "Can't insert fake timestamps — breaks the entire hash chain after that point"],
              ]}
            />
          </Section>

          {/* Section 36 */}
          <Section id="s36" num={36} title="Keys & Signatures (ed25519) &mdash; Your Digital Stamp">
            <Sub>The Lock and Key Analogy</Sub>
            <p>
              You have two things:
            </p>
            <Diagram>{`🔑 PRIVATE KEY (Secret — only YOU have it)
   Like the key to your diary. Never show anyone. Ever.

🔒 PUBLIC KEY (Shared with everyone — it's your wallet address)
   Like your home address. Anyone can know it. They can send you
   letters (SOL), but they can't get inside (steal your money).`}</Diagram>

            <Sub>How Signing Works</Sub>
            <p>
              When Ravi clicks &quot;Release Funds&quot; in Trustify:
            </p>
            <Diagram>{`1. The app creates a message: "Move 1 SOL from Locker #4521 to Priya"

2. Ravi's wallet uses his PRIVATE KEY to create a SIGNATURE:
   Private Key + Message → 🖋️ Signature (64 bytes of math)

3. The signature is sent to Solana along with the message

4. Solana uses Ravi's PUBLIC KEY to CHECK the signature:
   Public Key + Message + Signature → ✅ Valid! or ❌ Fake!

5. If valid → Solana knows it was REALLY Ravi, not an impersonator
   If invalid → Transaction REJECTED. Nobody's money moves.`}</Diagram>

            <Sub>Why This Is Unbreakable</Sub>
            <div className="space-y-3">
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">Can someone guess your private key?</p>
                <p className="text-neutral-400 text-sm mt-1">Your private key is 32 random bytes = 256 bits. The number of possible keys is 2^256 &mdash; that&apos;s more than the number of atoms in the observable universe. Even if every computer on Earth tried for billions of years, they couldn&apos;t guess it.</p>
              </div>
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">Can someone fake your signature?</p>
                <p className="text-neutral-400 text-sm mt-1">The signature depends on BOTH the private key AND the specific message. Even if someone saw 1 million of your signatures on other messages, they CANNOT forge a signature for a new message without your private key.</p>
              </div>
              <div className="border border-neutral-800 rounded-lg p-4">
                <p className="text-white font-semibold">Can someone figure out your private key from your public key?</p>
                <p className="text-neutral-400 text-sm mt-1">Going from public key &rarr; private key requires solving the &quot;discrete logarithm problem&quot; on an elliptic curve. No known algorithm can do this efficiently. It&apos;s a one-way trapdoor function.</p>
              </div>
            </div>

            <Sub>Why ed25519 Specifically?</Sub>
            <Table
              headers={["Feature", "ed25519 (Solana)", "ECDSA (Ethereum)"]}
              rows={[
                ["Speed", "~70,000 verifications/sec", "~30,000 verifications/sec"],
                ["Signature size", "64 bytes", "65 bytes"],
                ["Deterministic", "Yes (same message = same signature)", "No (needs random number — dangerous if RNG is bad)"],
                ["Timing attacks", "Immune (constant-time)", "Vulnerable if not careful"],
                ["Key size", "32 bytes", "32 bytes"],
              ]}
            />
          </Section>

          {/* Section 37 */}
          <Section id="s37" num={37} title="The File Fingerprint (IPFS & CIDs)">
            <Sub>The Old Way: Location Addressing</Sub>
            <p>
              Think of the normal internet like giving directions: &quot;Go to House #42 on Main Street and ask for the red book.&quot; But what if House #42 burns down? The red book is gone. What if the owner replaces the red book with a blue book? Same address, different book. You&apos;d never know.
            </p>

            <Sub>The IPFS Way: Content Addressing</Sub>
            <p>
              IPFS is different. Instead of saying WHERE something is, you describe WHAT it is:
            </p>
            <Diagram>{`Old way:  "Get the file at https://example.com/report.pdf"
          → Server dies? File GONE.
          → Server changes file? Same URL, different file. SNEAKY.

IPFS way: "Get the file whose fingerprint is bafybeig..."
          → The fingerprint IS the file's SHA-256 hash
          → Could be stored on ANY computer. Or thousands of computers.
          → Change one byte of the file? Different fingerprint = different address
          → IMPOSSIBLE to tamper without changing the address`}</Diagram>

            <Sub>How We Use It in Trustify</Sub>
            <Diagram>{`When Ravi creates an escrow:
  1. Ravi fills out: title, description, attached files
  2. We bundle it into a JSON file
  3. Upload JSON to IPFS → get back CID: bafybeiabc123...
  4. Store "ipfs://bafybeiabc123..." on-chain in the escrow account

When Priya submits work:
  1. Priya attaches deliverable files + GitHub link
  2. We bundle into a submission JSON
  3. Upload to IPFS → get back CID: bafybeixyz789...
  4. Store the CID on-chain

Now there's an IMMUTABLE CHAIN OF EVIDENCE:
  On-chain CID → points to IPFS JSON → contains file CIDs → actual files
  Nobody can change any of it without breaking the chain of fingerprints.`}</Diagram>

            <InsightBox>
              <p className="text-neutral-300">
                This is why a freelancer can PROVE they submitted work: the CID was stored on-chain at a specific blockchain timestamp. The CID is a fingerprint of the exact files they submitted. Nobody &mdash; not the freelancer, not the client, not us &mdash; can change what was submitted after the fact.
              </p>
            </InsightBox>
          </Section>

          {/* Section 38 */}
          <Section id="s38" num={38} title="The Board Game (State Machine)">
            <p>
              The escrow is like a board game with <strong>6 spaces</strong> and <strong>strict rules</strong> about which moves are allowed. You can only move forward (mostly), and some moves are one-way streets.
            </p>

            <Diagram>{`THE ESCROW BOARD GAME

  ┌──────────┐   Freelancer    ┌──────────────┐   Freelancer    ┌───────────┐   Client      ┌───────────┐
  │   OPEN   │   accepts       │ IN PROGRESS  │   submits      │ SUBMITTED │   releases   │ COMPLETED │
  │  (Start) │───────────────→ │  (Working)   │──────────────→ │  (Review) │────────────→ │  (Done!)  │
  └──────────┘                 └──────────────┘                └───────────┘              └───────────┘
       │                              │                              │
       │ Client cancels               │ Either party                 │ Either party
       │ (refund)                     │ disputes                     │ disputes
       ▼                              ▼                              ▼
  ┌───────────┐                ┌───────────┐                  ┌───────────┐
  │ CANCELLED │                │ DISPUTED  │                  │ DISPUTED  │
  │ (Game Off)│                │ (Problem!)│                  │ (Problem!)│
  └───────────┘                └───────────┘                  └───────────┘

GAME OVER spaces (no more moves):  COMPLETED ✓   CANCELLED ✗   DISPUTED ⚠`}</Diagram>

            <Sub>The Rules</Sub>
            <div className="space-y-3">
              <div className="border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 font-semibold text-sm">OPEN &rarr; IN PROGRESS</p>
                <p className="text-neutral-400 text-sm mt-1">Only a freelancer (not the client!) can make this move. If the escrow is &quot;directed&quot; (specific person invited), only THAT person can accept.</p>
              </div>
              <div className="border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 font-semibold text-sm">IN PROGRESS &rarr; SUBMITTED</p>
                <p className="text-neutral-400 text-sm mt-1">Only the assigned freelancer can submit. Must include proof (an IPFS CID). Empty submissions are rejected.</p>
              </div>
              <div className="border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 font-semibold text-sm">SUBMITTED &rarr; COMPLETED</p>
                <p className="text-neutral-400 text-sm mt-1">Only the client can release funds. Money flows from the PDA to the freelancer&apos;s wallet. This is the happy ending!</p>
              </div>
              <div className="border border-amber-500/20 rounded-lg p-4">
                <p className="text-amber-400 font-semibold text-sm">OPEN &rarr; CANCELLED</p>
                <p className="text-neutral-400 text-sm mt-1">Only the client can cancel, and ONLY from Open state. Once a freelancer accepts, cancellation is blocked forever. Money returns to client.</p>
              </div>
              <div className="border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 font-semibold text-sm">IN PROGRESS or SUBMITTED &rarr; DISPUTED</p>
                <p className="text-neutral-400 text-sm mt-1">Either the client OR freelancer can raise a dispute. Money stays locked. Needs off-chain resolution by a human.</p>
              </div>
            </div>

            <Sub>What Happens If Someone Tries to Cheat?</Sub>
            <Diagram>{`Freelancer tries to accept an already-accepted escrow:
  → Status is InProgress, not Open → ERROR: InvalidStatus

Client tries to cancel after freelancer started:
  → Status is InProgress, not Open → ERROR: CannotCancelInProgress

Random stranger tries to release funds:
  → Signer is not the client → ERROR: UnauthorizedClient

Freelancer tries to submit empty proof:
  → CID is empty → ERROR: EmptySubmissionCid

Client tries to be their own freelancer:
  → Signer equals client → ERROR: ClientCannotBeFreelancer

EVERY cheat attempt is caught by the smart contract. Every time.`}</Diagram>
          </Section>

          {/* Section 39 */}
          <Section id="s39" num={39} title="Why Solana is So Fast &mdash; The School Analogy">
            <p>
              Imagine three different schools and how they handle homework collection:
            </p>

            <Sub>Bitcoin School (Slow &mdash; 7 homework/sec)</Sub>
            <Diagram>{`Teacher: "Solve this impossible math puzzle!"
Students: *compete for 10 minutes*
Winner: "I solved it! Here's the homework batch!"
Teacher: "OK, that batch is official."

Problems:
  • Only ONE batch every 10 minutes
  • Massive energy wasted on the puzzle
  • Everyone else's work was for nothing`}</Diagram>

            <Sub>Ethereum School (Medium &mdash; 30 homework/sec)</Sub>
            <Diagram>{`Teacher: "Who has the most lunch money staked?"
Rich student: "Me! I'll collect the homework."
Teacher: "OK, but everyone must vote on whether this batch is correct."
*12 seconds of voting*
Teacher: "Approved! Next batch."

Better, but:
  • Still need everyone to vote on every batch
  • Voting takes time (12 seconds)
  • Can only process them ONE BY ONE`}</Diagram>

            <Sub>Solana School (Fast &mdash; 65,000 homework/sec)</Sub>
            <Diagram>{`Teacher has 5 superpowers:

1. PROOF OF HISTORY (the stamp machine)
   A non-stop stamp counter: #1, #2, #3...
   Every homework gets stamped → instant ordering, no debate

2. GULF STREAM (no homework pile)
   Students hand homework DIRECTLY to the next teacher
   No messy pile on the desk → less waiting

3. SEALEVEL (parallel grading)
   If Ravi's homework and Priya's homework are about different topics,
   TWO teachers grade them AT THE SAME TIME
   (In blockchain: non-conflicting transactions run in parallel)

4. TURBINE (fast distribution)
   Instead of photocopying the whole batch for everyone,
   give piece 1 to student A, piece 2 to student B, piece 3 to student C
   They share with each other (like BitTorrent)

5. CLOUDBREAK (organized filing cabinet)
   All student records in a fast-access filing system
   Can look up any student's grades instantly

Result: 400ms per batch, 65,000 homework papers per second!`}</Diagram>

            <InsightBox>
              <p className="text-neutral-300">
                For Trustify, Solana&apos;s speed means: creating an escrow feels instant (~2 seconds total), costs less than a penny, and can handle thousands of escrows simultaneously. On Bitcoin, one escrow would take 10 minutes and cost $5-50. On Ethereum, 12 seconds and $5-50. On Solana, 400ms and $0.00025.
              </p>
            </InsightBox>
          </Section>

          {/* Section 40 */}
          <Section id="s40" num={40} title="The Complete Story &mdash; How Every Algorithm Connects">
            <p>
              Now let&apos;s see how ALL the kid-friendly concepts work together in one real Trustify transaction:
            </p>
            <Diagram>{`RAVI CLICKS "CREATE ESCROW" FOR 1 SOL

Step 1: KEYS & SIGNATURES (ed25519)
  Ravi's wallet creates a message: "Create escrow, deposit 1 SOL"
  Ravi's PRIVATE KEY signs it → produces a 64-byte signature
  Anyone can verify with Ravi's PUBLIC KEY that it was really him

Step 2: THE MAGIC FINGERPRINT (SHA-256)
  SHA-256("escrow" + Ravi's wallet + job ID) = the locker address (PDA)
  SHA-256("account:Escrow") first 8 bytes = the account label (discriminator)

Step 3: THE MAGICAL LOCKER (PDA)
  A new locker is created at the computed address
  1 SOL moves from Ravi's wallet → into the locker
  Nobody has the key. Only the rule book (smart contract) can open it.

Step 4: THE FILE FINGERPRINT (IPFS)
  Task description uploaded to IPFS
  SHA-256(file) = CID (content address)
  CID stored on-chain: "ipfs://bafybeiabc..."
  Proof of what was agreed upon — tamper-proof

Step 5: THE UNSTOPPABLE CLOCK (Proof of History)
  This transaction gets stamped into Solana's PoH hash chain
  hash_N → [Ravi's tx inserted] → hash_N+1
  Everyone agrees on when this happened — uncheatble timestamp

Step 6: THE AVALANCHE EFFECT
  This block's hash depends on all previous blocks
  Change Ravi's transaction → this block's hash changes
  → next block's hash changes → ALL future blocks break
  → Tampering is mathematically impossible

Step 7: THE BOARD GAME (State Machine)
  Escrow status: OPEN ✓
  Waiting for a freelancer to accept...

  ─────────────────────────────────────────────

PRIYA CLICKS "ACCEPT ESCROW"

  Same process: signature verified, PoH timestamp, state changes
  Status: OPEN → IN PROGRESS
  Priya is now the assigned freelancer
  Ravi CANNOT cancel anymore (funds committed)

  ─────────────────────────────────────────────

PRIYA CLICKS "SUBMIT WORK"

  Her deliverables uploaded to IPFS → CID stored on-chain
  Status: IN PROGRESS → SUBMITTED
  Immutable proof she submitted specific files at this exact time

  ─────────────────────────────────────────────

RAVI CLICKS "RELEASE FUNDS"

  Signature verified: yes, it's really Ravi
  Status check: Submitted ✓
  Client check: Ravi is the client ✓
  Freelancer check: Priya matches ✓

  💰 1 SOL moves from the PDA locker → Priya's wallet
  Status: SUBMITTED → COMPLETED

  Everyone is happy. Math protected everyone. No trust needed.`}</Diagram>

            <InsightBox>
              <p className="text-neutral-300">
                <strong>That&apos;s the whole product.</strong> Six algorithms working together &mdash; SHA-256 for fingerprints, ed25519 for signatures, PDA for trustless custody, PoH for time ordering, avalanche effect for tamper-proofing, and IPFS for file integrity. Each one is simple on its own. Together, they create a system where two strangers can exchange money for work with zero trust, zero middlemen, and near-zero fees.
              </p>
            </InsightBox>
          </Section>

          {/* Footer */}
          <div className="mt-24 pt-8 border-t border-neutral-800 text-center pb-16">
            <p className="text-neutral-600 text-sm">
              Trustify &mdash; The Complete Bible. Built on Solana. Secured by math.
            </p>
            <p className="text-neutral-700 text-xs mt-2">
              Program ID: GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
