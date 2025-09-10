import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createHash } from "crypto";

const TOKEN_AUTH = "token-auth";
const PROGRAM_ID = new PublicKey("rwRDmR2VVp8wJrU8rfavxYWJZrLe3aCStcAZrZcPZmQ");

// Instruction discriminators
const CLAIM_INSTRUCTION = 0;
const NAMED_CLAIM_INSTRUCTION = 1;

const mints = [
  new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  new PublicKey("bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1"),
  new PublicKey("BLZEEuZUBVqFhj8adcCFPJvPVCiCyVmh3hkJMrU8KuJA"),
  new PublicKey("METADDFL6wWMWEoKTFJwcThTbUmtarRJZjRpzUvkxhr"),
];

/**
 * Converts a namespace string to an 8-byte identifier using SHA256 hash
 * @param namespace The namespace string to hash
 * @returns 8-byte Buffer containing the first 8 bytes of the SHA256 hash
 */
function namespaceToIdentifier(namespace: string): Buffer {
  const hash = createHash("sha256").update(namespace).digest();
  return hash.subarray(0, 8);
}

/**
 * Gets the PDA signer for a user, optionally with namespace
 * @param user User's public key
 * @param namespace Optional namespace string
 * @returns PDA signer public key
 */
function getPdaSigner(user: PublicKey, namespace?: string): PublicKey {
  const seeds = [Buffer.from(TOKEN_AUTH)]
  if (namespace) {
    seeds.push(namespaceToIdentifier(namespace));
  }
  seeds.push(user.toBuffer())
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0];
}

export function getUserEscrows(user: PublicKey, namespace?: string): PublicKey[] {
  return mints.map((mint) => {
    const pdaSigner = getPdaSigner(user, namespace);
    return getAssociatedTokenAddressSync(mint, pdaSigner, true);
  });
}

export function claimReward(
  user: PublicKey,
  mint: PublicKey,
  namespace?: string
): TransactionInstruction {
  const pdaSigner = getPdaSigner(user, namespace);
  const escrowTokenAccount = getAssociatedTokenAddressSync(
    mint,
    pdaSigner,
    true
  );
  const userTokenAccount = getAssociatedTokenAddressSync(mint, user, true);

  // Prepare instruction data
  let instructionData: Buffer;
  if (namespace) {
    // NamedClaim instruction: [discriminator(1), namespace_id(8)]
    const namespaceId = namespaceToIdentifier(namespace);
    instructionData = Buffer.concat([
      Buffer.from([NAMED_CLAIM_INSTRUCTION]),
      namespaceId
    ]);
  } else {
    // Regular Claim instruction: [discriminator(1)]
    instructionData = Buffer.from([CLAIM_INSTRUCTION]);
  }

  return new TransactionInstruction({
    keys: [
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: escrowTokenAccount, isSigner: false, isWritable: true },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: pdaSigner, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: instructionData,
  });
}

export function findRewardAccount(
  user: PublicKey,
  mint: PublicKey,
  namespace?: string
): PublicKey {
  const pdaSigner = getPdaSigner(user, namespace);
  return getAssociatedTokenAddressSync(mint, pdaSigner, true);
}

export function createRewardAccount(
  payer: PublicKey,
  user: PublicKey,
  mint: PublicKey,
  namespace?: string
): TransactionInstruction {
  const pdaSigner = getPdaSigner(user, namespace);
  const associatedTokenAccount = getAssociatedTokenAddressSync(
    mint,
    pdaSigner,
    true
  );
  return createAssociatedTokenAccountIdempotentInstruction(
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
  mint: PublicKey,
  namespace?: string
): TransactionInstruction {
  const pdaSigner = getPdaSigner(user, namespace);
  const escrowTokenAccount = getAssociatedTokenAddressSync(
    mint,
    pdaSigner,
    true
  );
  const payerTokenAccount = getAssociatedTokenAddressSync(mint, payer, true);

  return createTransferInstruction(
    payerTokenAccount,
    escrowTokenAccount,
    payer,
    amount
  );
}

// Utility exports for advanced use cases
export { namespaceToIdentifier, getPdaSigner };
