"use client";

import { useState } from "react";
import { usePrivy, useWallets, useSendTransaction } from "@privy-io/react-auth";
import { encodeFunctionData } from "viem";
import { payoutVaultAbi } from "@/lib/abis";
import { generateTierProof, ProveInputs } from "@/lib/generateProof";

export default function ClaimScreen() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const [status, setStatus] = useState("");
  const [txHash, setTxHash] = useState("");

  const proveInputs: ProveInputs = {
    artist_id: "1001",
    track_id: "5555",
    period_id: "202609",
    verified_count: "62000",
    salt: "918273645",
    merkle_path: ["1746698794234446904681958926613840148244277182607234960536445293175525482310", "7674326594546007994769196931584370601013048369040122230685400323830116836209", "13933017647007822260263830571154527935817107794322480484962082726191028879014", "20016437529941172917225597616404278364154550953547292605910076418585620487204", "2273402391602106480203421065428664313727070160453615311715152551027112603832", "608111928627449950871573930707571035388278567340752428664365575319371699122", "17911947419448613122758506129461863229533966937472299652031839442088994662745", "18099472923248414144046790627465744265585385046194106710618210833188042996200"],
    path_indices: ["0", "0", "0", "0", "0", "0", "0", "0"],
    root: "7264772886412666791416272095986303450893289674225826523000387371307532192431",
    tier_threshold: "50000"
  };

  async function handleClaim() {
    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
    if (!embeddedWallet) {
      setStatus("No embedded wallet found — log in first.");
      return;
    }

    setStatus("Generating proof in-browser...");
    const { proof, publicInputs } = await generateTierProof(proveInputs);

    setStatus("Submitting claim transaction...");
    const data = encodeFunctionData({
      abi: payoutVaultAbi,
      functionName: "claimPayout",
      args: [
        `0x${Buffer.from(proof).toString("hex")}` as `0x${string}`,
        publicInputs as `0x${string}`[],
        BigInt(proveInputs.artist_id),
        BigInt(proveInputs.track_id),
        BigInt(proveInputs.period_id),
        embeddedWallet.address as `0x${string}`
      ]
    });

    const receipt = await sendTransaction({
      to: process.env.NEXT_PUBLIC_PAYOUT_VAULT as `0x${string}`,
      data,
    });

    setTxHash(receipt.transactionHash);
    setStatus("Payout Claimed!");
  }

  if (!authenticated) {
    return <button onClick={login}>Log in to claim</button>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Artist — Generate Proof & Claim Payout</h1>
      <button onClick={handleClaim}>Generate Proof + Claim</button>
      <p>{status}</p>
      {txHash && (
        <p>
          <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noreferrer">
            View transaction on ArcScan
          </a>
        </p>
      )}
    </div>
  );
}
