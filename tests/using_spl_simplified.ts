import * as anchor from "@coral-xyz/anchor";
import { web3 } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UsingSplSimplified } from "../target/types/using_spl_simplified";
import { assert } from "chai";
import { BN } from "bn.js";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import dotenv from "dotenv"
dotenv.config();

describe("TESTING TOKEN CREATION", () => {
  const myKeypair = Keypair.fromSecretKey(
    Uint8Array.from(process.env.MY_SECRET_KEY)
  );

  const myWallet = new anchor.Wallet(myKeypair);

  const rpcConnection = new Connection(clusterApiUrl("devnet"), {
    commitment: "confirmed",
  });

  const newProvider = new anchor.AnchorProvider(rpcConnection, myWallet, {
    commitment: "confirmed",
  });

  anchor.setProvider(newProvider);

  const program = anchor.workspace
    .UsingSplSimplified as Program<UsingSplSimplified>;

  const METADATA_SEED = "metadata";
  const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );

  const payer = program.provider.publicKey;

  const mintAmount = 69;

  // set the toke decimals - 0 for example - MAKE SURE IT MATCHES THE ONE IN THE ```lib.rs``` file
  const TOKEN_DECIMALS = 6;

  const TOKEN_NAME = "Chirag Jani";
  const TOKEN_SYMBOL = "CAJ";
  const TOKEN_URI =
    "https://arweave.net/Xjqaj_rYYQGrsiTk9JRqpguA813w6NGPikcRyA1vAHM";
  const TOKEN_TAX = 300; // 100 = 1%

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

  it("Initialize", async () => {
    const info = await program.provider.connection.getAccountInfo(mintWithSeed);

    if (info) {
      return; // Do not attempt to initialize if already initialized
    }
    console.log("Mint not found. Initializing Program...");

    const context = {
      metadata: metadataAddress,
      mint: mintWithSeed,
      payer: payer,
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    };

    const txHash = await program.methods
      .initiateToken(TOKEN_NAME, TOKEN_SYMBOL, TOKEN_URI, TOKEN_TAX)
      .accounts(context)
      .rpc();

    await program.provider.connection.confirmTransaction(txHash, "finalized");
    console.log(`https://explorer.solana.com/tx/${txHash}?cluster=devnet`);
    const newInfo = await program.provider.connection.getAccountInfo(mintWithSeed);
    assert(newInfo, "Mint should be initialized.");
  });

  it("mint tokens", async () => {

    const destination = await getOrCreateAssociatedTokenAccount(
      rpcConnection,
      myWallet.payer,
      mintWithSeed,
      myWallet.publicKey
    );

    const context = {
      mint: mintWithSeed,
      destination: destination.address,
      payer: payer,
      rent: web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId

    };


    const txHash = await program.methods
      .mintSimpleTokens(TOKEN_NAME, new BN(mintAmount * 10 ** TOKEN_DECIMALS))
      .accounts(context)
      .rpc();
    await program.provider.connection.confirmTransaction(txHash);
    console.log(`  https://explorer.solana.com/tx/${txHash}?cluster=devnet`);

  });
});
