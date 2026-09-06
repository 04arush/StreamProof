// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Test } from "forge-std/Test.sol";
import "../src/Verifier.sol";

contract VerifierSmokeTest is Test {

    function test_ReadProofVerifies() public {
        HonkVerifier verifier = new HonkVerifier();

        bytes memory proof = vm.readFileBinary(
            "../circuits/target/proof"
        );

        bytes32[] memory publicInputs = new bytes32[](2);
        publicInputs[0] = bytes32(uint256(7264772886412666791416272095986303450893289674225826523000387371307532192431));
        publicInputs[1] = bytes32(uint256(50000));

        bool result = verifier.verify(proof, publicInputs);
        assertTrue(result);
    }
}
