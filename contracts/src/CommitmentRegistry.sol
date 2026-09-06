// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CommitmentRegistry
/// @author Arush Singh
/// @notice Stores a *write-only* Merkle root commitment per (artist, track, period)
contract CommitmentRegistry {

    // ==================== STATE VARIABLES ====================

    mapping(bytes32 => bytes32) public roots;


    // ======================== EVENTS =========================

    event CommitmentPosted(
        bytes32 indexed key,
        uint256 indexed artistId,
        uint256 indexed trackId,
        uint256 periodId,
        bytes32 root
    );


    // ======================== ERRORS =========================

    error CommitmentAlreadyExists(bytes32 key);


    // ======================= FUNCTIONS =======================

    // ------------------- External Functions ------------------

    ///
    /// @notice Posts a commitment
    /// @dev Reverts if a root already exists for this key
    /// @param artistId - The ID of the artist
    /// @param trackId - The ID of the track
    /// @param periodId - The ID of the period
    /// @param root - The Merkle root commitment
    function postCommitment(
        uint256 artistId,
        uint256 trackId,
        uint256 periodId,
        bytes32 root
    ) external {
        bytes32 key = keyFor(artistId, trackId, periodId);
        if (roots[key] != bytes32(0)) revert CommitmentAlreadyExists(key);
        roots[key] = root;
        emit CommitmentPosted(key, artistId, trackId, periodId, root);
    }

    /**
    /// @notice Returns the root for a given key
    /// @dev Reverts if no root exists for this key
    /// @param artistId - The ID of the artist
    /// @param trackId - The ID of the track
    /// @param periodId - The ID of the period
    /// @return The Merkle root commitment
    function getRoot(
        uint256 artistId,
        uint256 trackId,
        uint256 periodId
    ) external view returns (bytes32) {
        return roots[keyFor(artistId, trackId, periodId)];
    }

    // -------------------- Public Functions -------------------

    /**
    /// @notice Returns the key for a given artist, track, and period
    /// @dev The key is a keccak256 hash of the artist, track, and period IDs
    /// @param artistId - The ID of the artist
    /// @param trackId - The ID of the track
    /// @param periodId - The ID of the period
    /// @return The keccak256 hash of the artist, track, and period IDs
    function keyFor(
        uint256 artistId,
        uint256 trackId,
        uint256 periodId
    ) public pure returns (bytes32) {
        return keccak256(abi.encode(artistId, trackId, periodId));
    }
}
