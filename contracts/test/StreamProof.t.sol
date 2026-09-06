// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import "../src/Verifier.sol";
import "../src/CommitmentRegistry.sol";
import "../src/TierVerifier.sol";
import "../src/PayoutVault.sol";

contract MockUSDC {

    mapping(address => uint256) public balanceOf;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract StreamProofTest is Test {

    HonkVerifier verifier;
    CommitmentRegistry registry;
    TierVerifier tierVerifier;
    MockUSDC usdc;
    PayoutVault vault;

    uint256 constant ARTIST_ID = 1001;
    uint256 constant TRACK_ID = 5555;
    uint256 constant PERIOD_ID = 202609;
    uint256 constant TIER_THRESHOLD = 50000;

    function setUp() public {
        verifier = new HonkVerifier();
        registry = new CommitmentRegistry();
        tierVerifier = new TierVerifier(address(verifier), address(registry));
        usdc = new MockUSDC();
        vault = new PayoutVault(address(tierVerifier), address(usdc));

        usdc.mint(address(vault), 1_000_000_000);
        vault.setPayoutForTier(TIER_THRESHOLD, 500_000_000);
    }

    function test_FullFlow_ValidProofReleasesPayout() public {
        bytes memory proof = vm.readFileBinary("../circuits/target/proof");

        bytes32 root = bytes32(uint256(7264772886412666791416272095986303450893289674225826523000387371307532192431));
        registry.postCommitment(ARTIST_ID, TRACK_ID, PERIOD_ID, root);

        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = root;
        publicInputs[1] = bytes32(TIER_THRESHOLD);

        address artistWallet = address(0xBEEF);
        vault.claimPayout(proof, publicInputs, ARTIST_ID, TRACK_ID, PERIOD_ID, artistWallet);

        assertEq(usdc.balanceOf(artistWallet), 500_000_000);
    }
}
