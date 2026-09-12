# StreamProof

Privacy-preserving royalty tier verification and settlement, built for ETHOnline 2026.

A platform commits streaming data for a track as a Merkle root. An artist proves, via a zero-knowledge circuit, that their verified stream count crosses a specific payout tier — without revealing the exact count, and without the platform ever exposing its raw traffic data. A valid proof triggers an automatic on-chain payout.

## The problem

Royalty verification and privacy are usually in tension. Publishing exact play counts would let artists audit their own payouts, but it would also expose a platform's competitively sensitive traffic and individual listener data — so nobody does it, and settlement stays manual and trust-based. StreamProof resolves this by giving a verifiable yes/no answer ("crossed tier N") instead of the number itself.

## How it works

1. **Commit** — the platform builds a Merkle tree of per-track/period leaf data and posts only the root on-chain.
2. **Prove** — the artist generates a zero-knowledge proof, client-side, that a leaf under that root satisfies `verified_count ≥ tier_threshold`. The exact count is never revealed, on-chain or off.
3. **Verify & settle** — a Solidity verifier checks the proof on-chain against the correct stored root; a valid proof releases a fixed USDC payout for that tier.
4. **Identity** — the artist's ENSv2 name carries a single, narrowly scoped write permission (Enhanced Access Control) so the platform can post its commitment reference without touching anything else on the name.
5. **Wallet** — the artist authenticates and receives payout through a Privy embedded wallet; no seed phrase required.

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for circuit design, contract design, data flow, and known security considerations.

```
streamproof/
├── circuits/     # Noir — Merkle inclusion + threshold proof
├── scripts/      # TypeScript — Off-chain Merkle tree builder
├── contracts/    # Solidity — CommitmentRegistry, TierVerifier, PayoutVault, generated verifier
├── ens-scripts/  # ENSv2 identity scoping (Enhanced Access Control)
└── frontend/     # Next.js app — commitment posting, proof generation, claim flow
```


## Tech stack

| Layer | Tools |
|---|---|
| ZK circuit | Noir, Barretenberg (UltraHonk), Poseidon2 |
| Contracts | Solidity, Foundry, deployed on Arc Testnet |
| Identity | ENSv2 — Permissioned Resolver, Enhanced Access Control |
| Wallet & settlement | Privy embedded wallets, USDC on Arc |
| Frontend | Next.js, viem, NoirJS (in-browser proof generation) |

## Sponsor integrations

**Arc — programmable settlement.** The tier-triggered payout is a conditional payment: release is gated on a verified ZK proof, not a simple transfer. Deployed and tested on Arc Testnet.

**Privy — financial flow.** The artist authenticates via a Privy embedded wallet and receives a real on-chain USDC transfer directly into it — not a mocked login.

**ENS — Enhanced Access Control.** The platform is granted write access to exactly one text record (`streamproof:commitment-root`) on the artist's ENSv2 name, and nothing else. Verified with both a positive test (the grant works) and a negative test (writing any other record correctly reverts).

## Deployed contracts (Arc Testnet, chain ID `5042002`)

| Contract | Address | View on ArcScan |
|---|---|---|
| HonkVerifier | `0x2A69538B7a59cc981876801454105168F6547d96` | [View](https://testnet.arcscan.app/address/0x2A69538B7a59cc981876801454105168F6547d96) |
| CommitmentRegistry | `0xa3dbF9b8c503Af0AF18aD5c2b34d83e140Ffe509` | [View](https://testnet.arcscan.app/address/0xa3dbF9b8c503Af0AF18aD5c2b34d83e140Ffe509) |
| TierVerifier | `0x29474C2B019cCeE112a0Bc627b1903CE21901FfC` | [View](https://testnet.arcscan.app/address/0x29474C2B019cCeE112a0Bc627b1903CE21901FfC) |
| PayoutVault | `0xaCc2E6Db6e5900c6660C8881bD9DFe1abbfCBf20` | [View](https://testnet.arcscan.app/address/0xaCc2E6Db6e5900c6660C8881bD9DFe1abbfCBf20) |

Explorer: https://testnet.arcscan.app

## Running locally

Requires: Node.js 20+, Rust, Foundry, `nargo`/`bb` (Noir toolchain), a Privy app ID.

```bash
# Circuit
cd circuits && nargo compile

# Off-chain tree builder
cd ../scripts && npm install && npx tsx src/buildTree.ts

# Contracts
cd ../contracts && forge build && forge test

# ENS identity scripts
cd ../ens-scripts && npm install
# requires ARTIST_PRIVATE_KEY / PLATFORM_PRIVATE_KEY in .env

# Frontend
cd ../frontend && npm install
# requires .env.local — see .env.example
npm run dev
```

## Status

- ✅ Circuit compiles; Merkle-inclusion + threshold proof verified locally
- ✅ On-chain verification confirmed against a real generated proof (Foundry test, full pairing check passes)
- ✅ Contracts deployed and smoke-tested on Arc Testnet
- ✅ ENSv2 scoped write access confirmed with both positive and negative tests
- ✅ Privy embedded wallet creation working
- 🚧 In-browser proof generation (WASM) — being finalized for the live demo

## AI tool usage

See [`AI_USAGE.md`](./AI_USAGE.md).

## License

MIT
