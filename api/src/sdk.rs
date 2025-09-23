use crate::consts::TOKEN_AUTH;
use crate::instruction::{Claim, NamedClaim};
use crate::ID;
use solana_program::pubkey::Pubkey;
use solana_program::hash::hash;
use spl_associated_token_account::get_associated_token_address;
use steel::{AccountMeta, Instruction};

pub fn claim(signer: Pubkey, mint: Pubkey) -> Instruction {
    let signer_pda = Pubkey::find_program_address(&[TOKEN_AUTH, signer.as_ref()], &ID).0;
    let escrow_token_account = get_associated_token_address(&signer_pda, &mint);
    let user_token_account = get_associated_token_address(&signer, &mint);
    Instruction {
        program_id: crate::ID,
        accounts: vec![
            AccountMeta::new(signer, true),
            AccountMeta::new(escrow_token_account, false),
            AccountMeta::new(user_token_account, false),
            AccountMeta::new_readonly(signer_pda, false),
            AccountMeta::new_readonly(spl_token::id(), false),
        ],
        data: Claim {}.to_bytes(),
    }
}

pub fn named_claim(signer: Pubkey, mint: Pubkey, namespace: String) -> Instruction {
    let namespace_hash = hash(namespace.as_bytes());
    let namespace_bytes: [u8; 8] = namespace_hash.as_ref()[0..8].try_into().unwrap();
    let signer_pda = Pubkey::find_program_address(&[TOKEN_AUTH, &namespace_bytes, signer.as_ref()], &ID).0;
    let escrow_token_account = get_associated_token_address(&signer_pda, &mint);
    let user_token_account = get_associated_token_address(&signer, &mint);
    Instruction {
        program_id: crate::ID,
        accounts: vec![
            AccountMeta::new(signer, true),
            AccountMeta::new(escrow_token_account, false),
            AccountMeta::new(user_token_account, false),
            AccountMeta::new_readonly(signer_pda, false),
            AccountMeta::new_readonly(spl_token::id(), false),
        ],
        data: NamedClaim { namespace: namespace_bytes }.to_bytes(),
    }
}
