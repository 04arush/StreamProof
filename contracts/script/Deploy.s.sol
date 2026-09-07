// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Verifier.sol";
import "../src/CommitmentRegistry.sol";
import "../src/TierVerifier.sol";
import "../src/PayoutVault.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address usdcAddress = vm.envAddress("USDC_ADDRESS");

        vm.startBroadcast(deployerKey);

        HonkVerifier verifier = new HonkVerifier();
        console.log("HonkVerifier deployed at: ", address(verifier));

        CommitmentRegistry registry = new CommitmentRegistry();
        console.log("CommitmentRegistry deployed at: ", address(registry));

        TierVerifier tierVerifier = new TierVerifier(address(verifier), address(registry));
        console.log("TierVerifier deployed at: ", address(tierVerifier));

        PayoutVault vault = new PayoutVault(address(tierVerifier), usdcAddress);
        console.log("PayoutVault deployed at: ", address(vault));

        vm.stopBroadcast();
    }
}
