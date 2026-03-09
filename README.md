# Trustify — Decentralized Payment Escrow Middleware on Solana

Trustify is a universal payment escrow protocol built on Solana. It secures any transaction between two parties using smart contracts — no intermediaries, no custody, no fees.

**Program ID:** `GwMcGoxFd3ExF1QPA7qF9CjuN1ot4cMhTp5DyFs6z66R` (Devnet)

## Architecture

```
Frontend (Next.js)
    ↓
SDK (TrustifyButton, re-exports)
    ↓
Blockchain Interface (lib/solana.ts)
    ↓
Smart Contract (Anchor/Rust on Solana Devnet)
```

## Escrow Flow

1. **Sender creates escrow** — SOL is deposited into a Program Derived Address (PDA) vault
2. **Receiver accepts escrow** — Status moves to "In Progress"
3. **Receiver confirms delivery** — Status moves to "Submitted"
4. **Sender releases funds** — SOL transfers from vault to receiver

Cancellation and dispute mechanisms are also supported on-chain.

## Tech Stack

- **Smart Contract**: Rust + Anchor Framework
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Solana Wallet Adapter (Phantom)
- **Blockchain**: Solana Devnet

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Testing the Escrow Flow

1. Install [Phantom Wallet](https://phantom.app/) and switch to Devnet
2. Go to the Sender Dashboard and airdrop test SOL
3. Create an escrow with a description and amount
4. Open the Receiver Dashboard (different wallet) to accept the escrow
5. Mark delivery complete, then release funds from the Sender Dashboard

## Project Structure

```
├── anchor/              # Solana smart contract (Rust/Anchor)
├── app/
│   ├── page.tsx         # Landing page
│   ├── demo/            # Interactive demo walkthrough
│   ├── how-it-works/    # Escrow flow explanation
│   ├── integration-demo/# E-commerce integration example
│   ├── dashboard/
│   │   ├── sender/      # Sender dashboard (create/manage escrows)
│   │   └── receiver/    # Receiver dashboard (accept/deliver)
│   └── auth/            # Wallet-based auth
├── sdk/
│   ├── index.ts         # SDK re-exports with middleware naming
│   └── TrustifyButton.tsx # Embeddable payment component
├── lib/
│   └── solana.ts        # Blockchain interface (FROZEN)
├── idl/
│   └── trustify.json    # Program IDL (FROZEN)
└── components/          # Shared UI components
```

## Author

Built by **Yogeshwaran**
