import { PublicKey } from "@solana/web3.js";
import { claimReward, getUserEscrows, namespaceToIdentifier, getPdaSigner } from "./index";

// Example usage demonstrating namespace functionality

const user = new PublicKey("11111111111111111111111111111112");
const mint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"); // USDC

// Without namespace (regular claim)
console.log("=== Regular Claim (no namespace) ===");
const regularClaimIx = claimReward(user, mint);
console.log("Regular claim instruction data:", regularClaimIx.data);
console.log("PDA signer (no namespace):", getPdaSigner(user));

// With namespace (named claim)
console.log("\n=== Named Claim (with namespace) ===");
const namespace = "my-app-v1";
const namedClaimIx = claimReward(user, mint, namespace);
console.log("Named claim instruction data:", namedClaimIx.data);
console.log("Namespace identifier (8 bytes):", namespaceToIdentifier(namespace));
console.log("PDA signer (with namespace):", getPdaSigner(user, namespace));

// Compare escrow accounts
console.log("\n=== Escrow Account Comparison ===");
const regularEscrows = getUserEscrows(user);
const namespacedEscrows = getUserEscrows(user, namespace);
console.log("Regular escrows:", regularEscrows[0].toString());
console.log("Namespaced escrows:", namespacedEscrows[0].toString());
console.log("Are they different?", !regularEscrows[0].equals(namespacedEscrows[0]));
