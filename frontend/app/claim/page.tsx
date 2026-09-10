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
    root: "0x...",
    tier_threshold: "50000"
  };


}
