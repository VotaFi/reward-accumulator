use crate::consts::TOKEN_AUTH;
use crate::instruction::Claim;
use crate::ID;
use solana_program::pubkey::Pubkey;
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
