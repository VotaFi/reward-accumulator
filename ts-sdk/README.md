# Vota Accumulator SDK

This SDK is a Python library that provides an easy way to interact with the Vota Accumulator API.

Here is an example of how to send a reward to a user with `createRewardAccount` and `sendReward`.

```typescript
  const createIx = createRewardAccount(
        keypair.publicKey,
        userKeypair.publicKey,
        mint
    )
    const sendIx = sendReward(
        keypair.publicKey,
        userKeypair.publicKey,
        BigInt(100),
        mint)
    const blockhash = await connection.getLatestBlockhash();
    const message = new TransactionMessage({
        payerKey: keypair.publicKey,
        instructions: [createIx, sendIx],
        recentBlockhash: blockhash.blockhash,
    }).compileToV0Message();
    const tx = new VersionedTransaction(message);
    tx.sign([keypair]);
    const signature = await connection.sendTransaction(tx);
    const result = await connection.confirmTransaction({
        signature,
        ...blockhash
    });
    if (result.value.err) {
        console.log("Transaction failed", result.value.err);
    } else {
        console.log("Transaction sent with signature", signature);
    }

```

Here is how the user can claim the reward with `claimReward`
```typescript
  const userTokenAccountAddress = getAssociatedTokenAddressSync(mint, userKeypair.publicKey);
    const createUserTokenAccountIx = createAssociatedTokenAccountInstruction(
        userKeypair.publicKey,
        userTokenAccountAddress,
        userKeypair.publicKey,
        mint
    );
    const claimIx = claimReward(
        userKeypair.publicKey,
        mint
    );
    const blockhash = await connection.getLatestBlockhash();
    const message = new TransactionMessage({
        payerKey: userKeypair.publicKey,
        instructions: [createUserTokenAccountIx, claimIx],
        recentBlockhash: blockhash.blockhash,
    }).compileToV0Message();
    const tx = new VersionedTransaction(message);
    tx.sign([userKeypair]);
    const signature = await connection.sendTransaction(tx);
    const result = await connection.confirmTransaction({
        signature,
        ...blockhash
    });
    if (result.value.err) {
        console.log("Transaction failed", result.value.err);
    } else {
        console.log("Transaction sent with signature", signature);
    }
```