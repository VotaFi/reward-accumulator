import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
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
    const pdaSigner = PublicKey.findProgramAddressSync(
      [Buffer.from(TOKEN_AUTH), user.toBuffer()],
      PROGRAM_ID
    )[0];
    return getAssociatedTokenAddressSync(mint, pdaSigner, true);
  });
}

export function claimReward(user: PublicKey, mint: PublicKey) {
  const pdaSigner = PublicKey.findProgramAddressSync(
    [Buffer.from(TOKEN_AUTH), user.toBuffer()],
    PROGRAM_ID
  )[0];
  const escrowTokenAccount = getAssociatedTokenAddressSync(
    mint,
    pdaSigner,
    true
  );
  const userTokenAccount = getAssociatedTokenAddressSync(mint, user);

  return new TransactionInstruction({
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: escrowTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: pdaSigner, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: Buffer.from(Uint8Array.from([0])),
  });
}

export function createRewardAccount(
    payer: PublicKey,
    user: PublicKey,
    mint: PublicKey
    ) {
    const pdaSigner = PublicKey.findProgramAddressSync(
        [Buffer.from(TOKEN_AUTH), user.toBuffer()],
        PROGRAM_ID
    )[0];
    const associatedTokenAccount = getAssociatedTokenAddressSync(
        mint,
        pdaSigner,
        true
    );
    return createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        pdaSigner,
        mint,
    );
 }
export function sendReward(
  payer: PublicKey,
  user: PublicKey,
  amount: bigint,
  mint: PublicKey
) {
  const pdaSigner = PublicKey.findProgramAddressSync(
    [Buffer.from(TOKEN_AUTH), user.toBuffer()],
    PROGRAM_ID
  )[0];
  const escrowTokenAccount = getAssociatedTokenAddressSync(
    mint,
    pdaSigner,
    true
  );
  const payerTokenAccount = getAssociatedTokenAddressSync(mint, payer);

  return createTransferInstruction(
    payerTokenAccount,
    escrowTokenAccount,
    payer,
    amount
  );
}
