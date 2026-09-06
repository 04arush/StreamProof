// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TierVerifier.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PayoutVault {
    TierVerifier public immutable tierVerifier;
    IERC20 public immutable usdc;
    address public admin;

    mapping(uint256 => uint256) public payoutForTier;
    mapping(bytes32 => bool) public claimed;

    event TierPayoutConfigured(uint256 tierThreshold, uint256 amount);
    event PayoutReleased(
        uint256 indexed artistId,
        uint256 trackId,
        uint256 periodId,
        uint256 tierThreshold,
        address recipient,
        uint256 amount
    );

    error NotAdmin();
    error ProofInvalid();
    error AlreadyClaimed();
    error NoPayoutConfiguredForTier(uint256 tier);

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor(address _tierVerifier, address _usdc) {
        tierVerifier = TierVerifier(_tierVerifier);
        usdc = IERC20(_usdc);
        admin = msg.sender;
    }

    function setPayoutForTier(
        uint256 tierThreshold,
        uint256 amount
    ) external onlyAdmin {
        payoutForTier[tierThreshold] = amount;
        emit TierPayoutConfigured(tierThreshold, amount);
    }

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
}
