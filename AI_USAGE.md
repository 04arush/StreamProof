# AI Tool Usage

Per the hackathon's AI-tools disclosure requirement: Claude (Anthropic) was used throughout development as an interactive assistant, primarily for:

- **Debugging**: a hash-function bug in the circuit (an incorrect external Poseidon import produced classical Poseidon output instead of Poseidon2), and EIP-170 contract-size issues with the generated Solidity verifier.
- **Code review**: reviewing contract logic for correctness and flagging a real security gap in `PayoutVault.claimPayout` (see `ARCHITECTURE.md`).
- **Frontend integration**: working through Next.js/viem/Privy configuration issues.
- **Documentation**: structure this README and architecture documentation (reviewed and edited thoroughly).
