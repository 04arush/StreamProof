// This Script is used to test `./writeCommitment.ts`
// To check that the grant is genuinely narrow
// It should fail when called with different key

import { createWalletClient, http, namehash } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

const permissionedResolverAbi = [
    {
        type: "function",
        name: "setText",
        inputs: [
            { name: "node", type: "bytes32" },
            { name: "key", type: "string" },
            { name: "value", type: "string" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const;

const ARTIST_NAME = "akkua.eth";
const TEXT_KEY = "description";
const RESOLVER_ADDRESS = "0xd76959D2C3A41Acf96D7d543ca6C18EA67b878ac";

const PLATFORM_PRIVATE_KEY = process.env.PLATFORM_PRIVATE_KEY;
if (!PLATFORM_PRIVATE_KEY) throw new Error("Missing PLATFORM_PRIVATE_KEY in .env");

async function main() {
    const account = privateKeyToAccount(PLATFORM_PRIVATE_KEY as `0x${string}`);
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });
    const node = namehash(ARTIST_NAME);

    const txHash = await wallet.writeContract({
        address: RESOLVER_ADDRESS as `0x${string}`,
        abi: permissionedResolverAbi,
        functionName: "setText",
        args: [node, TEXT_KEY, "0x100fb73abc7d8d026cb6a0ee72f4ff375c00a640b140726208d6547c90828aaf"]
    });

    console.log("setText tx: ", txHash);
}

main();
