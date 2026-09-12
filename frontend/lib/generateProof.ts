import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@aztec/bb.js"
import circuitJson from "./circuit/circuits.json";

export interface ProveInputs {
  artist_id: string;
  track_id: string;
  period_id: string;
  verified_count: string;
  salt: string;
  merkle_path: string[];
  path_indices: string[];
  root: string;
  tier_threshold: string;
}

const toHex = (val: string) => `0x${BigInt(val).toString(16)}`;

export async function generateTierProof(inputs: ProveInputs) {
  try {
    const noir = new Noir(circuitJson as any);
    const backend = new UltraHonkBackend((circuitJson as any).bytecode, { threads: 1 });

    const formattedInputs = {
      artist_id: toHex(inputs.artist_id),
      track_id: toHex(inputs.track_id),
      period_id: toHex(inputs.period_id),
      salt: toHex(inputs.salt),
      merkle_path: inputs.merkle_path.map(toHex),
      path_indices: inputs.path_indices.map(toHex),
      root: toHex(inputs.root),
      verified_count: toHex(inputs.verified_count),
      tier_threshold: toHex(inputs.tier_threshold),
    };

    console.log("Executing witness generation...");
    const { witness } = await noir.execute(formattedInputs);

    console.log("Witness generated! Proving with UltraHonk...");
    const { proof, publicInputs } = await backend.generateProof(witness, { keccak: true });

    return { success: true, proof, publicInputs };
  } catch (error) {
    console.error("Failed to generate tier proof:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
