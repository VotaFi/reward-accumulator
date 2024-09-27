use reward_accumulator_api::ID;
use solana_program::program_option::COption;
use solana_program::program_pack::Pack;
use solana_program::pubkey;
use solana_program::pubkey::Pubkey;
use solana_program_test::{processor, tokio, BanksClient, ProgramTest};
use solana_sdk::account::Account;
use solana_sdk::signature::{Keypair, Signer};
use solana_sdk::transaction::Transaction;
use spl_associated_token_account::get_associated_token_address;
use spl_token::state::AccountState;
pub const USDC_MINT: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

#[tokio::test]
async fn test() {
    let mut program_test = ProgramTest::new(
        "reward_accumulator_program",
        ID,
        processor!(reward_accumulator_program::process_instruction),
    );
    let user = Keypair::new();
    program_test.add_account(
        user.pubkey(),
        Account {
            lamports: 100000000,
            data: vec![],
            owner: solana_program::system_program::id(),
            executable: false,
            rent_epoch: 0,
        },
    );
    let signer_pda = Pubkey::find_program_address(&[b"token-auth", user.pubkey().as_ref()], &ID).0;
    program_test.add_account_with_file_data(
        USDC_MINT,
        4118320394,
        spl_token::id(),
        "./tests/data/usdc_mint.bin",
    );
    // Add USDC escrow account
    let escrow_token_account_address = get_associated_token_address(&signer_pda, &USDC_MINT);
    let escrow_token_account = spl_token::state::Account {
        mint: USDC_MINT,
        owner: signer_pda,
        amount: 1_000_000,
        delegate: COption::None,
        state: AccountState::Initialized,
        is_native: COption::None,
        delegated_amount: 0,
        close_authority: COption::None,
    };
    let mut data: Vec<u8> = vec![0; spl_token::state::Account::get_packed_len()];
    escrow_token_account.pack_into_slice(&mut data);
    program_test.add_account(
        escrow_token_account_address,
        Account {
            lamports: 100000000,
            data,
            owner: spl_token::id(),
            executable: false,
            rent_epoch: 0,
        },
    );
    // Add USDC user token account
    let user_token_account_address = get_associated_token_address(&user.pubkey(), &USDC_MINT);
    let user_token_account = spl_token::state::Account {
        mint: USDC_MINT,
        owner: user.pubkey(),
        amount: 0,
        delegate: COption::None,
        state: AccountState::Initialized,
        is_native: COption::None,
        delegated_amount: 0,
        close_authority: COption::None,
    };
    let mut data: Vec<u8> = vec![0; spl_token::state::Account::get_packed_len()];
    user_token_account.pack_into_slice(&mut data);
    program_test.add_account(
        user_token_account_address,
        Account {
            lamports: 100000000,
            data,
            owner: spl_token::id(),
            executable: false,
            rent_epoch: 0,
        },
    );

    let (mut banks_client, _, recent_blockhash) = program_test.start().await;

    let ix = reward_accumulator_api::sdk::claim(user.pubkey(), USDC_MINT);
    let tx =
        Transaction::new_signed_with_payer(&[ix], Some(&user.pubkey()), &[&user], recent_blockhash);
    check_balance(user_token_account_address, &mut banks_client, 0).await;
    check_balance(escrow_token_account_address, &mut banks_client, 1_000_000).await;
    BanksClient::process_transaction(&mut banks_client, tx)
        .await
        .unwrap();
    check_balance(user_token_account_address, &mut banks_client, 1_000_000).await;
    check_balance(escrow_token_account_address, &mut banks_client, 0).await;
}

async fn check_balance(address: Pubkey, mut banks_client: &mut BanksClient, amount: u64) {
    let token_account = BanksClient::get_account(&mut banks_client, address)
        .await
        .unwrap()
        .unwrap();
    let token_account_data = spl_token::state::Account::unpack(&token_account.data).unwrap();
    assert_eq!(token_account_data.amount, amount);
}
