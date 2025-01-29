require("dotenv").config();
const {
    Client,
    AccountId,
    PrivateKey,
    TokenCreateTransaction,
    TokenMintTransaction,
    TokenAssociateTransaction,
    TransferTransaction,
    TokenType,
    TokenSupplyType,
    Hbar
} = require("@hashgraph/sdk");

// Load credentials from environment variables
const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const userId = AccountId.fromString(process.env.USER_ID);
const userKey = PrivateKey.fromString(process.env.USER_KEY);

// Initialize Hedera client
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

// Function to create a fungible token
async function createToken() {
    const tx = new TokenCreateTransaction()
        .setTokenName("MyToken")
        .setTokenSymbol("MTK")
        .setTokenType(TokenType.FungibleCommon)
        .setTreasuryAccountId(operatorId)
        .setInitialSupply(1000) // Initial supply
        .setDecimals(0)
        .setSupplyType(TokenSupplyType.Infinite)
        .setAdminKey(operatorKey)
        .setSupplyKey(operatorKey)
        .freezeWith(client);

    // Sign with the operator (treasury) key
    const signedTx = await tx.sign(operatorKey);
    const response = await signedTx.execute(client);
    const receipt = await response.getReceipt(client);

    console.log(`Token Created: MyToken (${receipt.tokenId})`);
    return receipt.tokenId;
}

// Function to associate an account with a token
async function associateToken(accountId, accountKey, tokenId) {
    console.log(`Associating account ${accountId} with token ${tokenId}...`);

    const tx = new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(client);

    // Fix: User must sign the transaction
    const signedTx = await tx.sign(accountKey);
    const response = await signedTx.execute(client);
    await response.getReceipt(client);

    console.log(`Account ${accountId} successfully associated with token ${tokenId}`);
}

// Function to transfer tokens
async function transferToken(tokenId, senderId, senderKey, recipientId, amount) {
    console.log(`Transferring ${amount} tokens from ${senderId} to ${recipientId}...`);

    const tx = new TransferTransaction()
        .addTokenTransfer(tokenId, senderId, -amount)
        .addTokenTransfer(tokenId, recipientId, amount)
        .freezeWith(client);

    // Fix: Ensure sender signs the transaction
    const signedTx = await tx.sign(senderKey);
    const response = await signedTx.execute(client);
    await response.getReceipt(client);

    console.log(`Transfer Successful: Treasury Balance: ${1000 - amount}, User Balance: ${amount}`);
}

// Function to mint additional tokens
async function mintTokens(tokenId, amount) {
    console.log(`Minting ${amount} additional tokens...`);

    const tx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setAmount(amount)
        .freezeWith(client);

    // Fix: Admin must sign the transaction
    const signedTx = await tx.sign(operatorKey);
    const response = await signedTx.execute(client);
    await response.getReceipt(client);

    console.log(`Successfully Minted ${amount} additional tokens.`);
}

// Run the token creation and transfer process
(async () => {
    try {
        console.log("Starting Hedera Token Operations...");

        // Step 1: Create the token
        const tokenId = await createToken();

        // Step 2: Associate user account with token
        await associateToken(userId, userKey, tokenId);

        // Step 3: Transfer tokens from treasury to user
        await transferToken(tokenId, operatorId, operatorKey, userId, 50);

        // Step 4: Mint additional tokens
        await mintTokens(tokenId, 500);
    } catch (error) {
        console.error("Error:", error);
    }
})();
