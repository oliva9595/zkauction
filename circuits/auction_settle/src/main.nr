// D:\dorahack\stellar\zkauction\circuits\auction_settle\src\main.nr
use dep::poseidon::poseidon2::Poseidon2;
global N: u32 = 8;

fn hash2(left: Field, right: Field) -> Field {
    Poseidon2::hash([left, right], 2)
}

fn main(
    bids: [Field; N],
    blindings: [Field; N],
    active: [bool; N],
    auction_id: pub Field,
    seller: pub Field,
    token_id: pub Field,
    commitments: pub [Field; N],
    reserve_price: pub Field,
    second_price: pub bool,
    winner_index: pub u32,
    clearing_price: pub Field
) {
    for i in 0..N {
        let c = hash2(bids[i], blindings[i]);
        let expected = if active[i] { c } else { 0 };
        assert(commitments[i] == expected);
    }
    
    let mut max_val: u64 = 0;
    let mut max_idx: u32 = 0;
    let mut second_val: u64 = 0;
    
    for i in 0..N {
        let bi = bids[i] as u64;
        if active[i] & (bi > max_val) {
            second_val = max_val; 
            max_val = bi; 
            max_idx = i;
        } else if active[i] & (bi > second_val) {
            second_val = bi;
        }
    }
    
    assert(winner_index == max_idx);
    assert(max_val >= reserve_price as u64);
    
    let expected_price: u64 = if second_price {
        if second_val < reserve_price as u64 { reserve_price as u64 } else { second_val }
    } else { 
        max_val 
    };
    
    assert(clearing_price as u64 == expected_price);
}

#[test]
fn test_first_price_winner() {
    let bids = [50,90,70,0,0,0,0,0];
    let blindings = [1,2,3,0,0,0,0,0];
    let active = [true,true,true,false,false,false,false,false];
    let mut commitments = [0; 8];
    for i in 0..3 { 
        commitments[i] = hash2(bids[i] as Field, blindings[i] as Field); 
    }
    main(bids.map(|x| x as Field), blindings.map(|x| x as Field), active,
         1, 2, 3, commitments, 10, false, 1, 90);
}

#[test]
fn test_second_price() {
    let bids = [50,90,70,0,0,0,0,0];
    let blindings = [1,2,3,0,0,0,0,0];
    let active = [true,true,true,false,false,false,false,false];
    let mut commitments = [0; 8];
    for i in 0..3 { 
        commitments[i] = hash2(bids[i] as Field, blindings[i] as Field); 
    }
    main(bids.map(|x| x as Field), blindings.map(|x| x as Field), active,
         1, 2, 3, commitments, 10, true, 1, 70);
}

#[test(should_fail)]
fn test_second_price_wrong_clearing() {
    let bids = [50,90,70,0,0,0,0,0];
    let blindings = [1,2,3,0,0,0,0,0];
    let active = [true,true,true,false,false,false,false,false];
    let mut commitments = [0; 8];
    for i in 0..3 { 
        commitments[i] = hash2(bids[i] as Field, blindings[i] as Field); 
    }
    // Should fail because clearing_price is passed as 90 but should be 70
    main(bids.map(|x| x as Field), blindings.map(|x| x as Field), active,
         1, 2, 3, commitments, 10, true, 1, 90);
}

#[test(should_fail)]
fn test_wrong_winner() {
    let bids = [50,90,70,0,0,0,0,0];
    let blindings = [1,2,3,0,0,0,0,0];
    let active = [true,true,true,false,false,false,false,false];
    let mut commitments = [0; 8];
    for i in 0..3 { 
        commitments[i] = hash2(bids[i] as Field, blindings[i] as Field); 
    }
    // Winner should be index 1
    main(bids.map(|x| x as Field), blindings.map(|x| x as Field), active,
         1, 2, 3, commitments, 10, false, 0, 90);
}

#[test(should_fail)]
fn test_below_reserve_price() {
    let bids = [50,90,70,0,0,0,0,0];
    let blindings = [1,2,3,0,0,0,0,0];
    let active = [true,true,true,false,false,false,false,false];
    let mut commitments = [0; 8];
    for i in 0..3 { 
        commitments[i] = hash2(bids[i] as Field, blindings[i] as Field); 
    }
    // Should fail because max bid (90) < reserve_price (100)
    main(bids.map(|x| x as Field), blindings.map(|x| x as Field), active,
         1, 2, 3, commitments, 100, false, 1, 90);
}

#[test]
fn test_second_price_below_reserve_clearing() {
    // max bid = 90, second bid = 50, reserve = 70
    // clearing price should be 70
    let bids = [50,90,20,0,0,0,0,0];
    let blindings = [1,2,3,0,0,0,0,0];
    let active = [true,true,true,false,false,false,false,false];
    let mut commitments = [0; 8];
    for i in 0..3 { 
        commitments[i] = hash2(bids[i] as Field, blindings[i] as Field); 
    }
    main(bids.map(|x| x as Field), blindings.map(|x| x as Field), active,
         1, 2, 3, commitments, 70, true, 1, 70);
}

#[test(should_fail)]
fn test_wrong_commitment_order() {
    let bids = [50,90,70,0,0,0,0,0];
    let blindings = [1,2,3,0,0,0,0,0];
    let active = [true,true,true,false,false,false,false,false];
    let mut commitments = [0; 8];
    for i in 0..3 { 
        commitments[i] = hash2(bids[i] as Field, blindings[i] as Field); 
    }
    // Swap commitments
    let temp = commitments[0];
    commitments[0] = commitments[1];
    commitments[1] = temp;
    
    main(bids.map(|x| x as Field), blindings.map(|x| x as Field), active,
         1, 2, 3, commitments, 10, false, 1, 90);
}

#[test(should_fail)]
fn test_first_price_cannot_settle_second_price() {
    let bids = [50,90,70,0,0,0,0,0];
    let blindings = [1,2,3,0,0,0,0,0];
    let active = [true,true,true,false,false,false,false,false];
    let mut commitments = [0; 8];
    for i in 0..3 { 
        commitments[i] = hash2(bids[i] as Field, blindings[i] as Field); 
    }
    // Attempting to settle using first-price logic (clearing_price=90) 
    // on a contract expecting second_price=true
    main(bids.map(|x| x as Field), blindings.map(|x| x as Field), active,
         1, 2, 3, commitments, 10, true, 1, 90);
}
