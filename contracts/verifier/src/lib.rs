#![no_std]

use soroban_sdk::{contract, contractimpl, Bytes, Env};

#[contract]
pub struct UltraHonkVerifier;

#[contractimpl]
impl UltraHonkVerifier {
    pub fn verify_proof_with_stored_vk(_env: Env, _proof: Bytes) {
        // Mock Verifier: Luôn trả về thành công mà không kiểm tra thực tế
        // Hữu ích cho việc deploy demo/hackathon khi chưa sinh được VK
    }
}
