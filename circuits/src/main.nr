use poseidon::poseidon2::Poseidon2;

global TREE_DEPTH: u32 = 8;

fn main(

    // ----- Private Inputs -------------------
    artist_id: Field,
    track_id: Field,
    period_id: Field,
    verified_count: u64,
    salt: Field,
    merkle_path: [Field; TREE_DEPTH],
    path_indices: [Field; TREE_DEPTH],

    // ----- Public Inputs --------------------
    root: pub Field,
    tier_threshold: pub u64
) {
    // Recompute the leaf hash
    let leaf = Poseidon2::hash(
        [artist_id, track_id, period_id, verified_count as Field, salt],
        5,
    );

    // Walk the Merkle path (bottom-up)
    let mut current = leaf;
    for i in 0..TREE_DEPTH {
        let sibling = merkle_path[i];
        let is_right = path_indices[i] == 1;
        current = if is_right {
            Poseidon2::hash([sibling, current], 2)
        } else {
            Poseidon2::hash([current, sibling], 2)
        };
    }

    // Verify the Merkle root with the on-chain commitment
    assert(current == root);
    // Verify that the verified count is above the tier threshold (artist's actual privacy preserving claim)
    assert(verified_count >= tier_threshold);
}
