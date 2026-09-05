import { poseidon2Hash } from "@zkpassport/poseidon2";

// TREE_DEPTH same as the circuit in `../circuits/src/main.nr`.
const TREE_DEPTH = 8;
const NUM_LEAVES = 2 ** TREE_DEPTH;

// "leaf" -> hash of (artist_id, track_id, period_id, verified_count, salt)
interface LeafPreimage {
  artistId: bigint;
  trackId: bigint;
  periodId: bigint;
  verifiedCount: bigint;
  salt: bigint;
}

function hashLeaf(p: LeafPreimage): bigint {
  return poseidon2Hash([p.artistId, p.trackId, p.periodId, p.verifiedCount, p.salt]);
}

function hashPair(left: bigint, right: bigint): bigint {
  return poseidon2Hash([left, right]);
}

// This will be replaced with real per-track/period leaf data when it is wired to the actual platform export.
const leaves: LeafPreimage[] = [];
leaves.push({
  artistId: 1001n,
  trackId: 5555n,
  periodId: 202609n,  // "2026-09" encoded as a number
  verifiedCount: 62000n,  // artist crossed the 50k stream tier
  salt: 918273645n,
});
for (let i = 1; i < NUM_LEAVES; i++) {
  leaves.push({
    artistId: BigInt(2000 + i),
    trackId: BigInt(6000 + i),
    periodId: 202609n,
    verifiedCount: BigInt(i * 37),
    salt: BigInt(1000000 + i),
  });
}

function buildTree(leafHashes: bigint[]): bigint[][] {
  const levels: bigint[][] = [leafHashes];
  let current = leafHashes;
  for (let d = 0; d < TREE_DEPTH; d++) {
    const next: bigint[] = [];
    for (let i = 0; i < current.length; i += 2) {
      next.push(hashPair(current[i], current[i + 1]));
    }
    levels.push(next);
    current = next;
  }
  return levels; // levels[0] = leaves, levels[TREE_DEPTH] = root
}

function getPath(levels: bigint[][], leafIndex: number) {
  const path: bigint[] = [];
  const indices: number[] = []; // 0 = left child, 1 = right child
  let idx = leafIndex;
  for (let d = 0; d < TREE_DEPTH; d++) {
    const isRightChild = idx % 2 === 1;
    const siblingIdx = isRightChild ? idx - 1 : idx + 1;
    path.push(levels[d][siblingIdx]);
    indices.push(isRightChild ? 1 : 0);
    idx = Math.floor(idx / 2);
  }
  return { path, indices };
}

const leafHashes = leaves.map(hashLeaf);
const levels = buildTree(leafHashes);
const root = levels[TREE_DEPTH][0];

const TARGET_LEAF_INDEX = 0;
const { path, indices } = getPath(levels, TARGET_LEAF_INDEX);
const target = leaves[TARGET_LEAF_INDEX];

console.log(`artist_id = "${target.artistId}"`);
console.log(`track_id = "${target.trackId}"`);
console.log(`period_id = "${target.periodId}"`);
console.log(`verified_count = "${target.verifiedCount}"`);
console.log(`salt = "${target.salt}"`);
console.log(`merkle_path = [${path.map((p) => `"${p}"`).join(", ")}]`);
console.log(`path_indices = [${indices.map((i) => `"${i}"`).join(", ")}]`);
console.log(`root = "${root}"`);
