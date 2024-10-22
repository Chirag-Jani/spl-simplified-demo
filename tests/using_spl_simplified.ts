import * as anchor from "@coral-xyz/anchor";
import { web3 } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UsingSplSimplified } from "../target/types/using_spl_simplified";
import { assert } from "chai";
import { BN } from "bn.js";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, createAssociatedTokenAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();

describe("TESTING TOKEN CREATION AND MINTING", () => {
  const myKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(process.env.MY_SECRET_KEY))
  );

  const myWallet = new anchor.Wallet(myKeypair);

  const rpcConnection = new Connection(clusterApiUrl("devnet"), {
    commitment: "confirmed",
  });

  const newProvider = new anchor.AnchorProvider(rpcConnection, myWallet, {
    commitment: "confirmed",
  });

  anchor.setProvider(newProvider);

  const program = anchor.workspace.UsingSplSimplified as Program<UsingSplSimplified>;

  const METADATA_SEED = "metadata";
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const payer = program.provider.publicKey;
  const mintAmount = 100;
  const TOKEN_DECIMALS = 6;
  const TOKEN_NAME = "Token8";
  const TOKEN_SYMBOL = "TKN8";
  const TOKEN_URI = "";
  // const TOKEN_URI = "https://arweave.net/Xjqaj_rYYQGrsiTk9JRqpguA813w6NGPikcRyA1vAHM";
  const TOKEN_TAX = 5100; // 100 = 1%

  const [mintWithSeed] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(TOKEN_NAME)],
    program.programId
  );

  const [metadataAddress] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from(METADATA_SEED),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintWithSeed.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );


  it("Mint Tokens with Metadata Creation", async () => {
    console.log("Minting and initializing tokens with metadata...");

    // Check if the mint account already exists
    const existingMintInfo = await program.provider.connection.getAccountInfo(mintWithSeed);
    if (existingMintInfo) {
      console.log("Mint account already exists, skipping minting.");
      return;
    }

    const destination = await getAssociatedTokenAddress(mintWithSeed, myWallet.publicKey);

    const context = {
      mint: mintWithSeed,
      destination: destination,
      payer: payer,
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      metadata: metadataAddress,
    };

    const txHash = await program.methods
      .mintSimpleTokens(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_URI, TOKEN_TAX, new BN(mintAmount * 10 ** TOKEN_DECIMALS))
      .accounts(context)
      .rpc();

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    console.log(`Transaction completed: https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    const newInfo = await program.provider.connection.getAccountInfo(mintWithSeed);
    assert(newInfo, "Mint should be initialized and tokens minted.");
  });


  it("Transfer Tokens", async () => {
    console.log("Minting and initializing tokens with metadata...");

    const source = await getAssociatedTokenAddress(mintWithSeed, myWallet.publicKey);
    const kp = Keypair.generate();
    const wal = new anchor.Wallet(kp);
    const destination = await getAssociatedTokenAddress(mintWithSeed, myWallet.publicKey);

    console.log("Destination is: ", destination);

    const context = {
      mint: mintWithSeed,
      source: source,
      destination: destination,
      authority: myWallet.payer,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      rent: web3.SYSVAR_RENT_PUBKEY,
    };

    console.log(context)
    const txHash = await program.methods
      .transferSimpleTokens(TOKEN_NAME, new BN(mintAmount * 10 ** TOKEN_DECIMALS))
      .accounts(context)
      .signers([myWallet.payer])
      .rpc();

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    console.log(`Transaction completed: https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

    const newInfo = await program.provider.connection.getAccountInfo(mintWithSeed);
    assert(newInfo, "Mint should be initialized and tokens minted.");
  });
});
