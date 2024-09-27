# Vota Reward Accumulator

This program allows a protocol to send tokens to PDAs dervived from a user's wallet address
to accumulate tokens, which the user can claim at any time by signing a transaction with the
claim instruction.

## Testing the program

```bash
cargo test-sbf
```