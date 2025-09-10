use reward_accumulator_api::consts::TOKEN_AUTH;
use reward_accumulator_api::ID;
use solana_program::account_info::AccountInfo;
use solana_program::entrypoint::ProgramResult;
use solana_program::program_pack::Pack;
use steel::*;

pub fn process_named_claim(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let namespace : &[u8; 8] = data.try_into()
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    let [signer, escrow_token_account, user_token_account, signer_pda, token_program] = accounts
    else {
        return Err(ProgramError::NotEnoughAccountKeys);
    };
    signer.is_signer()?.is_writable()?;
    let (signer_pda_address, bump) =
        Pubkey::find_program_address(&[TOKEN_AUTH, namespace, signer.key.as_ref()], &ID);
    let from_token_account = spl_token::state::Account::unpack(&escrow_token_account.data.borrow())?;
    if from_token_account.owner != signer_pda_address {
        return Err(ProgramError::InvalidAccountData);
    }

    transfer_signed(
        signer_pda,
        escrow_token_account,
        user_token_account,
        token_program,
        from_token_account.amount,
        &[&[TOKEN_AUTH, namespace, signer.key.as_ref(), &[bump]]],
    )?;

    Ok(())
}
