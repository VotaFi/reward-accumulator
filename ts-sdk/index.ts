import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const TOKEN_AUTH = "token-auth";
const PROGRAM_ID = new PublicKey("rwRDmR2VVp8wJrU8rfavxYWJZrLe3aCStcAZrZcPZmQ");

const mints = [
  new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1"),
  new PublicKey("BLZEEuZUBVqFhj8adcCFPJvPVCiCyVmh3hkJMrU8KuJA"),
  new PublicKey("METADDFL6wWMWEoKTFJwcThTbUmtarRJZjRpzUvkxhr"),
];

export function getUserEscrows(user: PublicKey): PublicKey[] {
  return mints.map((mint) => {
    const pda_signer = PublicKey.findProgramAddressSync(
      [Buffer.from(TOKEN_AUTH), user.toBuffer()],
      PROGRAM_ID
    )[0];
    return getAssociatedTokenAddressSync(mint, pda_signer, true);
  });
}

export function createClaimRewardInstruction(user: PublicKey, mint: PublicKey) {
  const pda_signer = PublicKey.findProgramAddressSync(
    [Buffer.from(TOKEN_AUTH), user.toBuffer()],
    PROGRAM_ID
  )[0];
  const escrow_token_account = getAssociatedTokenAddressSync(
    mint,
    pda_signer,
    true
  );
  const user_token_account = getAssociatedTokenAddressSync(mint, user);

  return new TransactionInstruction({
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: escrow_token_account, isSigner: false, isWritable: true },
      { pubkey: user_token_account, isSigner: false, isWritable: true },
      { pubkey: pda_signer, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: Buffer.from(Uint8Array.from([0])),
  });
}

export function createDistributeRewardInstruction(
  payer: PublicKey,
  amount: bigint,
  mint: PublicKey
) {
  const pda_signer = PublicKey.findProgramAddressSync(
    [Buffer.from(TOKEN_AUTH), payer.toBuffer()],
    PROGRAM_ID
  )[0];
  const escrow_token_account = getAssociatedTokenAddressSync(
    mint,
    pda_signer,
    true
  );
  const payer_token_account = getAssociatedTokenAddressSync(mint, payer);

  return createTransferInstruction(
    payer_token_account,
    escrow_token_account,
    payer,
    amount
  );
}
