"use client";

import { useState } from "react";
import { usePrivy, useWallets, useSendTransaction } from "@privy-io/react-auth";
import { encodeFunctionData } from "viem";
import { payoutVaultAbi } from "@/lib/abis";
import { generateTierProof, ProveInputs } from "@/lib/generateProof";

const STEPS = ["Generate proof", "Submit transaction", "Confirmed"] as const;

export default function ClaimScreen() {
  const { login, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const [step, setStep] = useState<-1 | 0 | 1 | 2>(-1);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const proveInputs: ProveInputs = {
    artist_id: "1001",
    track_id: "5555",
    period_id: "202609",
    verified_count: "62000",
    salt: "918273645",
    merkle_path: [
      "1746698794234446904681958926613840148244277182607234960536445293175525482310",
      "7674326594546007994769196931584370601013048369040122230685400323830116836209",
      "13933017647007822260263830571154527935817107794322480484962082726191028879014",
      "20016437529941172917225597616404278364154550953547292605910076418585620487204",
      "2273402391602106480203421065428664313727070160453615311715152551027112603832",
      "608111928627449950871573930707571035388278567340752428664365575319371699122",
      "17911947419448613122758506129461863229533966937472299652031839442088994662745",
      "18099472923248414144046790627465744265585385046194106710618210833188042996200",
    ],
    path_indices: ["0", "0", "0", "0", "0", "0", "0", "0"],
    root: "7264772886412666791416272095986303450893289674225826523000387371307532192431",
    tier_threshold: "50000",
  };

  async function handleClaim() {
    setError("");
    const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
    if (!embeddedWallet) {
      setError("No embedded wallet found — log in first.");
      return;
    }

    try {
      setStep(0);
      const result = await generateTierProof(proveInputs);

      if (!result.success || !result.proof) {
        throw new Error(result.error || "Proof generation failed");
      }

      setStep(1);
      const data = encodeFunctionData({
        abi: payoutVaultAbi,
        functionName: "claimPayout",
        args: [
          `0x${Buffer.from(result.proof).toString("hex")}` as `0x${string}`,
          result.publicInputs as `0x${string}`[],
          BigInt(proveInputs.artist_id),
          BigInt(proveInputs.track_id),
          BigInt(proveInputs.period_id),
          embeddedWallet.address as `0x${string}`,
        ],
      });

      const receipt = await sendTransaction({
        to: process.env.NEXT_PUBLIC_PAYOUT_VAULT as `0x${string}`,
        data,
      });

      setTxHash(receipt.hash);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep(-1);
    }
  }

  if (!authenticated) {
    return (
      <div>
        <h1 className="font-serif text-3xl text-foreground">Claim payout</h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
          Log in with the wallet whose royalty tier you&rsquo;re proving.
        </p>
        <button
          onClick={login}
          className="mt-6 border border-accent px-5 py-2.5 font-mono text-[13px] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Log in
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground">Claim payout</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        Generates a proof that this artist crossed the stream-tier threshold,
        then submits it for a payout — the exact stream count is never
        revealed.
      </p>

      <button
        onClick={handleClaim}
        disabled={step === 0 || step === 1}
        className="mt-8 border border-accent px-5 py-2.5 font-mono text-[13px] text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
      >
        Generate proof &amp; claim
      </button>

      {step !== -1 && (
        <ol className="mt-8 border-t border-border">
          {STEPS.map((label, i) => {
            const state = i < step ? "done" : i === step ? "active" : "pending";
            return (
              <li
                key={label}
                className="flex items-center gap-3 border-b border-border py-3"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    state === "done"
                      ? "bg-accent"
                      : state === "active"
                        ? "animate-pulse bg-foreground"
                        : "bg-border"
                  }`}
                />
                <span
                  className={`font-mono text-[13px] ${
                    state === "pending" ? "text-muted" : "text-foreground"
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {error && <p className="mt-6 text-[13px] text-danger">{error}</p>}

      {txHash && (
        <p className="mt-6 font-mono text-[13px] text-foreground">

          <a href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
          >
            View transaction on ArcScan
          </a>
        </p>
      )}
    </div>
  );
}
