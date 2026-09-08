import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const client = createPublicClient({
    chain: sepolia,
    transport: http()
});

async function main() {
    const resolverAddress = await client.getEnsResolver({
        name: "akkua.eth"
    });
    console.log("Resolver Address: ", resolverAddress);
}

main();
