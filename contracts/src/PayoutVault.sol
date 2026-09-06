// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TierVerifier.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title PayoutVault
/// @author Arush Singh
/// @notice Manages the payout vault for the StreamProof protocol
contract PayoutVault {

    // ==================== STATE VARIABLES ====================

    TierVerifier public immutable tierVerifier;
    IERC20 public immutable usdc;
    address public admin;

    mapping(uint256 => uint256) public payoutForTier;
    mapping(bytes32 => bool) public claimed;


    // ======================== EVENTS =========================

    event TierPayoutConfigured(uint256 tierThreshold, uint256 amount);
    event PayoutReleased(
        uint256 indexed artistId,
        uint256 trackId,
        uint256 periodId,
        uint256 tierThreshold,
        address recipient,
        uint256 amount
    );


    // ======================== ERRORS =========================

    error NotAdmin();
    error ProofInvalid();
    error AlreadyClaimed();
    error NoPayoutConfiguredForTier(uint256 tier);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }


    // ======================= FUNCTIONS =======================

    // ---------------------- Constructor ----------------------

    constructor(address _tierVerifier, address _usdc) {
        tierVerifier = TierVerifier(_tierVerifier);
        usdc = IERC20(_usdc);
        admin = msg.sender;
    }

    // ------------------- External Functions --------------------

    /// @notice Sets the payout amount for a given tier threshold
    /// @dev Only callable by the admin
    /// @param tierThreshold - The tier threshold for which to set the payout
    /// @param amount - The amount to set as the payout for the given tier
    function setPayoutForTier(
        uint256 tierThreshold,
        uint256 amount
    ) external onlyAdmin {
        payoutForTier[tierThreshold] = amount;
        emit TierPayoutConfigured(tierThreshold, amount);
    }

    /// @notice Claims the payout for a given tier threshold
    /// @param proof - The proof to verify the tier threshold
    /// @param publicInputs - The public inputs for the tier threshold proof
    /// @param artistId - The ID of the artist
    /// @param trackId - The ID of the track
    /// @param periodId - The ID of the period
    /// @param recipient - The recipient of the payout
    function claimPayout(
        bytes calldata proof,
        bytes32[] calldata publicInputs,
        uint256 artistId,
        uint256 trackId,
        uint256 periodId,
        address recipient
    ) external {
        (bool valid, uint256 tierThreshold) = tierVerifier.verifyTierProof(
            proof, publicInputs, artistId, trackId, periodId
        );
        if (!valid) revert ProofInvalid();

        bytes32 key = claimKey(artistId, trackId, periodId, tierThreshold);
        if (claimed[key]) revert AlreadyClaimed();

        uint256 amount = payoutForTier[tierThreshold];
        if (amount == 0) revert NoPayoutConfiguredForTier(tierThreshold);

        claimed[key] = true;
        require(usdc.transfer(recipient, amount), "USDC transfer failed");

        emit PayoutReleased(artistId, trackId, periodId, tierThreshold, recipient, amount);
    }

    // -------------------- Public Functions ---------------------

    /// @notice Claims the key for a given tier threshold
    /// @param artistId - The ID of the artist
    /// @param trackId - The ID of the track
    /// @param periodId - The ID of the period
    /// @param tierThreshold - The tier threshold for which to claim the key
    /// @return key - The claimed key
    function claimKey(
        uint256 artistId,
        uint256 trackId,
        uint256 periodId,
        uint256 tierThreshold
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            artistId,
            trackId,
            periodId,
            tierThreshold
        ));
    }
}
