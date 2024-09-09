import * as anchor from "@coral-xyz/anchor";
import { Program, web3 } from "@coral-xyz/anchor";
import { AnchorInteractBubblegum } from "../target/types/anchor_interact_bubblegum";
import { getMerkleTreeSize } from "@metaplex-foundation/mpl-bubblegum";
import { v5 as uuidv5 } from "uuid";
import { PublicKey } from "@solana/web3.js";
import crypto from "crypto";
export const MPL_BUBBLEGUM_PROGRAM_ID = new anchor.web3.PublicKey(
  "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"
);

export const SPL_NOOP_PROGRAM_ID = new anchor.web3.PublicKey(
  "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"
);

export const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID = new anchor.web3.PublicKey(
  "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"
);

const MY_NAMESPACE = "fb363670-d047-466b-ab6c-002230aecfcd";

describe("anchor-interact-bubblegum", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace
    .AnchorInteractBubblegum as Program<AnchorInteractBubblegum>;

  const [user1, user2] = [web3.Keypair.generate(), web3.Keypair.generate()];

  const merkleTree = web3.Keypair.generate();
  console.log("MerkleTree", merkleTree.publicKey.toBase58());

  const maxDepth = 3;
  const maxBufferSize = 8;
  const merkleTreeSize = getMerkleTreeSize(maxDepth, maxBufferSize);

  const [treeConfig] = anchor.web3.PublicKey.findProgramAddressSync(
    [merkleTree.publicKey.toBuffer()],
    MPL_BUBBLEGUM_PROGRAM_ID
  );
  console.log("treeConfig", treeConfig.toBase58());

  const collectionId = uuidv5("cnft collection", MY_NAMESPACE);
  before(async () => {
    {
      await provider.connection.confirmTransaction({
        signature: await provider.connection.requestAirdrop(
          user1.publicKey,
          10 * anchor.web3.LAMPORTS_PER_SOL
        ),
        ...(await provider.connection.getLatestBlockhash()),
      });
      await provider.connection.confirmTransaction({
        signature: await provider.connection.requestAirdrop(
          user2.publicKey,
          10 * anchor.web3.LAMPORTS_PER_SOL
        ),
        ...(await provider.connection.getLatestBlockhash()),
      });
    }
  });
  it("create tree", async () => {
    let accIx = anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.publicKey,
      newAccountPubkey: merkleTree.publicKey,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        merkleTreeSize
      ),
      space: merkleTreeSize,
      programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    });

    // transaction.add(accIx);
    // Add your test here.
    const tx = await program.methods
      .createTree(maxDepth, maxBufferSize)
      .accounts({
        merkleTree: merkleTree.publicKey,
        payer: provider.publicKey,
        treeConfig,
        treeCreator: provider.publicKey,
      })
      .preInstructions([accIx])
      .signers([merkleTree])
      .rpc();

    console.log("Your transaction signature", tx);
  });

  it("create collection", async () => {
    const uri = "https://example.com/my-collection-cNft.json";
    const symbol = "cNFT1";
    const name = "My Collection cNFT 1";
    const id = `collection_${collectionId}`;
    let hexString = crypto
      .createHash("sha256")
      .update(id, "utf-8")
      .digest("hex");
    let seed = Uint8Array.from(Buffer.from(hexString, "hex"));
    // const id = new anchor.BN(1);
    // const [collectionMint] = PublicKey.findProgramAddressSync(
    //   [Buffer.from(`collection`), id.toArrayLike(Buffer, "le", 8)],
    //   program.programId
    // );

    const [collectionMint] = PublicKey.findProgramAddressSync(
      [seed],
      program.programId
    );
    const tx = await program.methods
      .createCollection(id, name, symbol, uri)
      .accountsPartial({
        payer: provider.publicKey,
        collectionMint,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });

  it("mint cnft", async () => {
    const uri = "https://example.com/my-collection-cNft.json";
    const symbol = "cNFT1";
    const name = "My Collection cNFT 1";

    const tx = await program.methods
      .mintCnft(name, symbol, uri)
      .accounts({
        merkleTree: merkleTree.publicKey,
        payer: provider.publicKey,
        treeCreator: provider.publicKey,
        treeConfig,
        leafDelegate: user1.publicKey,
        leafOwner: user1.publicKey,
      })
      .rpc();

    console.log("Your transaction signature", tx);
  });
});
