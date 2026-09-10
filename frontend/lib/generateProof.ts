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

export async function generateTierProof(inputs: ProveInputs) {
  const noir = new Noir(circuitJson as any);
  const backend = new UltraHonkBackend((circuitJson as any).bytecode);

  const { witness } = await noir.execute(inputs as any);

  const { proof, publicInputs } = await backend.generateProof(witness, { keccak: true });

  return { proof, publicInputs };
}
