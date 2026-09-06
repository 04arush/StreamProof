// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Verifier.sol";
import "./CommitmentRegistry.sol";

contract TierVerifier {

    // ==================== STATE VARIABLES ====================

    HonkVerifier public immutable verifier;
    CommitmentRegistry public immutable registry;


    // ========================= ERRORS ========================

    error RootMismatch(bytes32 expected, bytes32 got);


    // ======================= FUNCTIONS =======================

    // ---------------------- Constructor ----------------------

    constructor(address _verifier, address _registry) {
        verifier = HonkVerifier(_verifier);
        registry = CommitmentRegistry(_registry);
    }

    // ------------------- External Functions ------------------

   /// @notice Verifies a tier proof against the commitment registry
   /// @dev Reverts if the proof is invalid or the root does not match the expected root
   /// @param proof - Raw bb-generated proof bytes
   /// @param publicInputs - bb's public inputs array — order must be [root, tier_threshold]
   ///                       matching `../circuits/src/main.nr`'s parameter order
   /// @param artistId - The artist ID
   /// @param trackId - The track ID
   /// @param periodId - The period ID
   /// @return valid - Whether the proof is valid
   /// @return tierThreshold - The tier threshold
    function verifyTierProof(
        bytes calldata proof,
        bytes32[] calldata publicInputs,
        uint256 artistId,
        uint256 trackId,
        uint256 periodId
    ) external view returns (bool valid, uint256 tierThreshold) {
        bytes32 expectedRoot = registry.getRoot(artistId, trackId, periodId);
        bytes32 proofRoot = publicInputs[0];
        if (proofRoot != expectedRoot) revert RootMismatch(expectedRoot, proofRoot);

        valid = verifier.verify(proof, publicInputs);
        tierThreshold = uint256(publicInputs[1]);
    }
}
