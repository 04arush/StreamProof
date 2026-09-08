import { createWalletClient, http, namehash, toHex } from "viem";
import { packetToBytes } from "viem/ens";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import "dotenv/config";

const permissionedResolverAbi = [
    {
        type: "function",
        name: "authorizeTextRoles",
        inputs: [
            { name: "toName", type: "bytes" },
            { name: "key", type: "string" },
            { name: "account", type: "address" },
            { name: "grant", type: "bool" }
        ],
        outputs: [],
        stateMutability: "nonpayable"
    }
] as const;

const ARTIST_NAME = "akkua.eth";
const TEXT_KEY = "streamproof:commitment-root";
const RESOLVER_ADDRESS = "0xd76959D2C3A41Acf96D7d543ca6C18EA67b878ac";
const PLATFORM_OPERATING_ADDRESS = "0xcd46DD935bb6F2e4C4470A1b7B85A98DFf9e011F";

const ARTIST_PRIVATE_KEY = process.env.ARTIST_PRIVATE_KEY;
if (!ARTIST_PRIVATE_KEY) throw new Error("Missing ARTIST_PRIVATE_KEY in .env");

async function main() {
    const account = privateKeyToAccount(ARTIST_PRIVATE_KEY as `0x${string}`);
    const wallet = createWalletClient({ account, chain: sepolia, transport: http() });

    const dnsName = toHex(packetToBytes(ARTIST_NAME));

    const txHash = await wallet.writeContract({
        address: RESOLVER_ADDRESS as `0x${string}`,
        abi: permissionedResolverAbi,
        functionName: "authorizeTextRoles",
        args: [dnsName, TEXT_KEY, PLATFORM_OPERATING_ADDRESS as `0x${string}`, true]
    });

    console.log("authorizeTextRoles tx: ", txHash);
}

main();
