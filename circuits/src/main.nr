use poseidon::poseidon2::Poseidon2;

global TREE_DEPTH: u32 = 8;

fn main(
    artist_id: Field,
    track_id: Field,
    period_id: Field,
    verified_count: Field,
    salt: Field,
    merkle_path: [Field; TREE_DEPTH],
    path_indices: [Field; TREE_DEPTH],
    root: pub Field,
) {
    let leaf = Poseidon2::hash(
        [artist_id, track_id, period_id, verified_count, salt],
        5,
    );

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

    assert(current == root);
}
