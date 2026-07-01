#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, xdr::ToXdr, Address, Bytes, BytesN, Env,
};

#[cfg(all(not(test), feature = "nethermind-verifier"))]
use ultrahonk_soroban_verifier::UltraHonkVerifier as NethermindUltraHonkVerifier;

#[cfg(all(not(test), not(feature = "nethermind-verifier")))]
compile_error!("A verifier backend is required. Enable the `nethermind-verifier` feature.");

#[cfg(all(feature = "static-vk", not(test)))]
const STATIC_VK: &[u8] = include_bytes!("../../../circuits/auction_settle/target/vk/vk");

const PERSISTENT_BUMP_THRESHOLD: u32 = 345_600;
const PERSISTENT_LIFETIME: u32 = 2_073_600;
const INSTANCE_BUMP_THRESHOLD: u32 = 345_600;
const INSTANCE_LIFETIME: u32 = 2_073_600;

#[contract]
pub struct AuctionContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Status {
    Open,
    Closed,
    Settled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuctionParams {
    pub seller: Address,
    pub token: Address,
    pub reserve_price: u64,
    pub second_price: bool, // true if Vickrey
    pub deadline: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuctionData {
    pub id: u64,
    pub params: AuctionParams,
    pub status: Status,
    pub bidder_count: u32,
    pub winner: Option<Address>,
    pub clearing_price: Option<u64>,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
enum DataKey {
    Admin,
    VerifyingKey,
    NextAuctionId,
    Auction(u64),
    Commitment(u64, u32), // auction_id, index -> (Address, BytesN<32>, i128)
    SettledProof(BytesN<32>),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    AuctionMissing = 3,
    NotClosed = 4,
    NotOpen = 5,
    PastDeadline = 6,
    TooEarlyToClose = 7,
    AlreadySettled = 8,
    InvalidCommitment = 9,
    AuctionFull = 10,
    VerificationFailed = 11,
    VkParseError = 12,
    EmptyProof = 13,
    InvalidEscrow = 14,
    InsufficientEscrow = 15,
}

#[contractimpl]
impl AuctionContract {
    pub fn __constructor(env: Env, admin: Address, vk_bytes: Bytes) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::VerifyingKey, &vk_bytes);
        env.storage().instance().set(&DataKey::NextAuctionId, &1_u64);
        Self::extend_instance_ttl(&env);
    }

    pub fn create_auction(env: Env, params: AuctionParams) -> Result<u64, Error> {
        Self::extend_instance_ttl(&env);
        let id: u64 = env.storage().instance().get(&DataKey::NextAuctionId).ok_or(Error::NotInitialized)?;
        
        let auction = AuctionData {
            id,
            params,
            status: Status::Open,
            bidder_count: 0,
            winner: None,
            clearing_price: None,
        };
        
        let key = DataKey::Auction(id);
        env.storage().persistent().set(&key, &auction);
        Self::extend_persistent_ttl(&env, &key);
        
        env.storage().instance().set(&DataKey::NextAuctionId, &(id + 1));
        Ok(id)
    }

    pub fn get_auction(env: Env, auction_id: u64) -> Result<AuctionData, Error> {
        let key = DataKey::Auction(auction_id);
        let auction = env.storage().persistent().get(&key).ok_or(Error::AuctionMissing)?;
        Self::extend_persistent_ttl(&env, &key);
        Ok(auction)
    }

    pub fn commit_bid(
        env: Env,
        auction_id: u64,
        bidder: Address,
        commitment: BytesN<32>,
        escrow_amount: i128,
    ) -> Result<u32, Error> {
        bidder.require_auth();
        
        let mut auction = Self::get_auction(env.clone(), auction_id)?;
        if auction.status != Status::Open {
            return Err(Error::NotOpen);
        }
        if env.ledger().timestamp() >= auction.params.deadline {
            return Err(Error::PastDeadline);
        }
        if auction.bidder_count >= 8 {
            return Err(Error::AuctionFull);
        }
        if escrow_amount <= 0 {
            return Err(Error::InvalidEscrow);
        }

        // Transfer escrow funds from bidder to contract
        let token_client = soroban_sdk::token::Client::new(&env, &auction.params.token);
        token_client.transfer(&bidder, &env.current_contract_address(), &escrow_amount);
        
        let index = auction.bidder_count;
        let key = DataKey::Commitment(auction_id, index);
        env.storage().persistent().set(&key, &(bidder.clone(), commitment, escrow_amount));
        Self::extend_persistent_ttl(&env, &key);
        
        auction.bidder_count += 1;
        let auction_key = DataKey::Auction(auction_id);
        env.storage().persistent().set(&auction_key, &auction);
        Self::extend_persistent_ttl(&env, &auction_key);
        
        Ok(index)
    }

    pub fn close_commit_phase(env: Env, auction_id: u64) -> Result<(), Error> {
        let mut auction = Self::get_auction(env.clone(), auction_id)?;
        if auction.status != Status::Open {
            return Err(Error::NotOpen);
        }
        if env.ledger().timestamp() < auction.params.deadline {
            return Err(Error::TooEarlyToClose);
        }
        
        auction.status = Status::Closed;
        let key = DataKey::Auction(auction_id);
        env.storage().persistent().set(&key, &auction);
        Self::extend_persistent_ttl(&env, &key);
        Ok(())
    }

    pub fn get_commitment(env: Env, auction_id: u64, index: u32) -> Result<(Address, BytesN<32>, i128), Error> {
        let key = DataKey::Commitment(auction_id, index);
        env.storage().persistent().get(&key).ok_or(Error::InvalidCommitment)
    }

    pub fn settle(
        env: Env,
        auction_id: u64,
        proof: Bytes,
        winner_index: u32,
        clearing_price: u64,
    ) -> Result<(), Error> {
        let proof_hash: BytesN<32> = env.crypto().keccak256(&proof).into();
        let settled_key = DataKey::SettledProof(proof_hash.clone());
        if env.storage().persistent().has(&settled_key) {
            return Err(Error::AlreadySettled);
        }

        let mut auction = Self::get_auction(env.clone(), auction_id)?;
        if auction.status != Status::Closed {
            return Err(Error::NotClosed);
        }

        if winner_index < auction.bidder_count {
            let (_, _, winner_escrow) = Self::get_commitment(env.clone(), auction_id, winner_index)?;
            if winner_escrow < clearing_price as i128 {
                return Err(Error::InsufficientEscrow);
            }
        }

        // Pack public inputs
        let public_inputs = Self::pack_public_inputs(
            &env,
            &auction,
            winner_index,
            clearing_price,
        )?;

        // Verify proof
        Self::verify_ultrahonk(&env, &public_inputs, &proof)?;

        // Update state
        auction.status = Status::Settled;
        if winner_index < auction.bidder_count {
            let (winner_addr, _, _) = Self::get_commitment(env.clone(), auction_id, winner_index)?;
            auction.winner = Some(winner_addr);
        }
        auction.clearing_price = Some(clearing_price);

        env.storage().persistent().set(&DataKey::Auction(auction_id), &auction);
        env.storage().persistent().set(&settled_key, &true);
        Self::extend_persistent_ttl(&env, &DataKey::Auction(auction_id));
        Self::extend_persistent_ttl(&env, &settled_key);
        
        // Token transfers: refund losers, pay seller, refund winner difference
        let token_client = soroban_sdk::token::Client::new(&env, &auction.params.token);
        for i in 0..auction.bidder_count {
            let (bidder_addr, _, escrow_amount) = Self::get_commitment(env.clone(), auction_id, i)?;
            if i == winner_index {
                let to_seller = core::cmp::min(escrow_amount, clearing_price as i128);
                if to_seller > 0 {
                    token_client.transfer(&env.current_contract_address(), &auction.params.seller, &to_seller);
                }
                let refund = escrow_amount - to_seller;
                if refund > 0 {
                    token_client.transfer(&env.current_contract_address(), &bidder_addr, &refund);
                }
            } else {
                if escrow_amount > 0 {
                    token_client.transfer(&env.current_contract_address(), &bidder_addr, &escrow_amount);
                }
            }
        }
        
        Ok(())
    }

    pub fn pack_public_inputs_view(
        env: Env,
        auction_id: u64,
        winner_index: u32,
        clearing_price: u64,
    ) -> Result<Bytes, Error> {
        let auction = Self::get_auction(env.clone(), auction_id)?;
        Self::pack_public_inputs(&env, &auction, winner_index, clearing_price)
    }

    fn pack_public_inputs(
        env: &Env,
        auction: &AuctionData,
        winner_index: u32,
        clearing_price: u64,
    ) -> Result<Bytes, Error> {
        let mut out = Bytes::new(env);
        
        // auction_id, seller, token_id
        out.append(&Self::field_bytes_from_u64(env, auction.id));
        // Encode addresses into 32-bytes hash for the circuit, and mask the highest byte 
        // to ensure the resulting integer fits safely within the BN254 scalar field (254 bits).
        let mut seller_hash: [u8; 32] = env.crypto().keccak256(&auction.params.seller.clone().to_xdr(env)).into();
        seller_hash[0] = 0; 
        out.append(&Bytes::from_array(env, &seller_hash)); 
        
        let mut token_hash: [u8; 32] = env.crypto().keccak256(&auction.params.token.clone().to_xdr(env)).into();
        token_hash[0] = 0;
        out.append(&Bytes::from_array(env, &token_hash)); 

        // 8 Commitments
        for i in 0..8 {
            if i < auction.bidder_count {
                let (_, c, _) = Self::get_commitment(env.clone(), auction.id, i)?;
                out.append(&Bytes::from(c));
            } else {
                out.append(&Bytes::from_array(env, &[0; 32]));
            }
        }

        // reserve_price, second_price, winner_index, clearing_price
        out.append(&Self::field_bytes_from_u64(env, auction.params.reserve_price));
        out.append(&Self::field_bytes_from_u32(env, if auction.params.second_price { 1 } else { 0 }));
        out.append(&Self::field_bytes_from_u32(env, winner_index));
        out.append(&Self::field_bytes_from_u64(env, clearing_price));

        Ok(out)
    }

    fn field_bytes_from_u64(env: &Env, value: u64) -> Bytes {
        let mut bytes = [0u8; 32];
        bytes[24..32].copy_from_slice(&value.to_be_bytes());
        Bytes::from_array(env, &bytes)
    }

    fn field_bytes_from_u32(env: &Env, value: u32) -> Bytes {
        let mut bytes = [0u8; 32];
        bytes[28..32].copy_from_slice(&value.to_be_bytes());
        Bytes::from_array(env, &bytes)
    }

    #[cfg(not(test))]
    fn verify_ultrahonk(env: &Env, public_inputs: &Bytes, proof: &Bytes) -> Result<(), Error> {
        #[cfg(feature = "static-vk")]
        let vk_bytes = Bytes::from_slice(env, STATIC_VK);

        #[cfg(not(feature = "static-vk"))]
        let vk_bytes: Bytes = env
            .storage()
            .instance()
            .get(&DataKey::VerifyingKey)
            .ok_or(Error::NotInitialized)?;
            
        #[cfg(feature = "nethermind-verifier")]
        {
            let verifier =
                NethermindUltraHonkVerifier::new(env, &vk_bytes).map_err(|_| Error::VkParseError)?;
            verifier
                .verify(env, proof, public_inputs)
                .map_err(|_| Error::VerificationFailed)?;
            return Ok(());
        }
    }

    #[cfg(test)]
    fn verify_ultrahonk(env: &Env, public_inputs: &Bytes, proof: &Bytes) -> Result<(), Error> {
        if proof.len() == 0 {
            return Err(Error::EmptyProof);
        }
        // Hash the proof using Keccak256
        let _proof_hash: Bytes = env.crypto().keccak256(&proof).into();
        // Mock verifier checks if the proof equals the hash of public inputs.
        // This ensures mutated public inputs will fail verification.
        let expected_hash = env.crypto().keccak256(public_inputs);
        let expected_bytes: Bytes = expected_hash.into();
        
        if proof != &expected_bytes {
            return Err(Error::VerificationFailed);
        }
        Ok(())
    }

    fn extend_instance_ttl(env: &Env) {
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_BUMP_THRESHOLD, INSTANCE_LIFETIME);
    }

    fn extend_persistent_ttl(env: &Env, key: &DataKey) {
        env.storage()
            .persistent()
            .extend_ttl(key, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_LIFETIME);
    }
}

mod test;
