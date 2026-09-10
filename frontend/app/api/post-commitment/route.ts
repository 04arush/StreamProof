import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arcTestnet } from "@/lib/circuit/arcChain";
import { commitmentRegistryAbi } from "@/lib/abis";

export async function POST(req: NextRequest) {
  const { artistId, trackId, periodId, root } = await req.json();

  const account = privateKeyToAccount(process.env.PLATFORM_PRIVATE_KEY as `0x${string}`);
  const wallet = createWalletClient({ account, chain: arcTestnet, transport: http() });

  try {
    const txHash = await wallet.writeContract({
      address: process.env.NEXT_PUBLIC_COMMITMENT_REGISTRY as `0x${string}`,
      abi: commitmentRegistryAbi,
      functionName: "postCommitment",
      args: [BigInt(artistId), BigInt(trackId), BigInt(periodId), root as `0x${string}`]
    });
    return NextResponse.json({ txHash });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
