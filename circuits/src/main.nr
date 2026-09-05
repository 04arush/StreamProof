use poseidon::poseidon::bn254::{hash_2, hash_4};

// Supports up to 2^8 = 256 levels in the Merkle tree
global TREE_DEPTH: u32 = 8;

fn main(

    // ----- Private Inputs ---------------
    artist_id: Field,
    track_id: Field,
    period_id: Field,
    verified_count: Field,
    salt: Field,
    merkle_path: [Field; TREE_DEPTH],
    path_indices: [Field; TREE_DEPTH],  // 0 = left child, 1 = right child

    // ----- Public Inputs -----------------
    root: pub Field
) {
    // Recompute the leaf hash from the private preimage
    let partial_hash = hash_4([
        artist_id,
        track_id,
        period_id,
        verified_count
    ]);
    let hash = hash_2([partial_hash, salt]);

    // Walk the Merkle path to verify the root (bottom-up)
    let mut current = hash;
    for i in 0..TREE_DEPTH {
        let sibling = merkle_path[i];
        let is_right = path_indices[i] == 1;
        current = if is_right {
            hash_2([sibling, current])
        } else {
            hash_2([current, sibling])
        };
    }

    // Verify the recomputed root matches the on-chain commitment
    assert(current == root);
}
