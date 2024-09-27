mod claim;

use claim::*;

use reward_accumulator_api::instruction::AccumulatorInstruction;
use solana_program::account_info::AccountInfo;
use solana_program::entrypoint;
use solana_program::entrypoint::ProgramResult;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    if program_id.ne(&reward_accumulator_api::ID) {
        return Err(ProgramError::IncorrectProgramId);
    }

    let (tag, _) = data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match AccumulatorInstruction::try_from(*tag).or(Err(ProgramError::InvalidInstructionData))? {
        AccumulatorInstruction::Claim => process_claim(accounts)?,
    }
    Ok(())
}
