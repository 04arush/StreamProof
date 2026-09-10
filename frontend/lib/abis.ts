export const commitmentRegistryAbi = [
  {
    type: "function",
    name: "postCommitment",
    inputs: [
      { name: "artistId", type: "uint256" },
      { name: "trackId", type: "uint256" },
      { name: "periodId", type: "uint256" },
      { name: "root", type: "bytes32" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;

export const payoutVaultAbi = [
  {
    type: "function",
    name: "claimPayout",
    inputs: [
      { name: "proof", type: "bytes" },
      { name: "publicInputs", type: "bytes32[]" },
      { name: "artistId", type: "uint256" },
      { name: "trackId", type: "uint256" },
      { name: "periodId", type: "uint256" },
      { name: "recipient", type: "address" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;
