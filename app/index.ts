import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import * as dotenv from "dotenv";
import idl from "../target/idl/anchor_interact_bubblegum.json";
import { AnchorInteractBubblegum } from "../target/types/anchor_interact_bubblegum";
import { getMerkleTreeSize } from "@metaplex-foundation/mpl-bubblegum";
dotenv.config();

export const MPL_BUBBLEGUM_PROGRAM_ID = new PublicKey(
  "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"
);

export const SPL_NOOP_PROGRAM_ID = new PublicKey(
  "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"
);

export const SPL_ACCOUNT_COMPRESSION_PROGRAM_ID = new PublicKey(
  "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"
);

(async () => {
  const connection = new Connection(
    "https://devnet-rpc.shyft.to/?api_key=037o0cpTSD8FBXv7",
    "confirmed"
  );
  const creator_wallet = new Wallet(
    Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(process.env.CREATOR_WALLET!))
    )
  );
  const provider = new AnchorProvider(connection, creator_wallet, {
    preflightCommitment: "confirmed",
  });

  const program = new Program(idl as AnchorInteractBubblegum, provider);

  const merkleTree = Keypair.generate();
  console.log("MerkleTree", merkleTree.publicKey.toBase58());

  const maxDepth = 3;
  const maxBufferSize = 8;
  const merkleTreeSize = getMerkleTreeSize(maxDepth, maxBufferSize);

  const [treeConfig] = PublicKey.findProgramAddressSync(
    [merkleTree.publicKey.toBuffer()],
    MPL_BUBBLEGUM_PROGRAM_ID
  );
  console.log("treeConfig", treeConfig.toBase58());

  // let accIx = SystemProgram.createAccount({
  //   fromPubkey: provider.publicKey,
  //   newAccountPubkey: merkleTree.publicKey,
  //   lamports: await provider.connection.getMinimumBalanceForRentExemption(
  //     merkleTreeSize
  //   ),
  //   space: merkleTreeSize,
  //   programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  // });

  // const tx_create = await program.methods
  //   .createTree(maxDepth, maxBufferSize)
  //   .accounts({
  //     merkleTree: merkleTree.publicKey,
  //     payer: provider.publicKey,
  //     treeConfig,
  //     treeCreator: provider.publicKey,
  //   })
  //   .preInstructions([accIx])
  //   .signers([merkleTree])
  //   .rpc();

  // console.log("Your transaction signature", tx_create);

  const uri =
    "https://raw.githubusercontent.com/HongThaiPham/summer-bootcamp-anchor-token2022-stake/main/app/assets/token-info.json";
  const symbol = "C" + Math.floor(Math.random() * 100);
  const name = "My Collection cNFT 1" + Math.floor(Math.random() * 100);

  const tx_mint = await program.methods
    .mintCnft(name, symbol, uri)
    .accounts({
      merkleTree: new PublicKey("Cg2qFiFyNx8eNnKyeoQ1vb8ZXGMLrLEj3uita4qadEYY"),
      payer: provider.publicKey,
      treeCreator: provider.publicKey,
      treeConfig: new PublicKey("DgejAjW94HY5Ub22zqutwoYZju6yvy7ryZRTPchW7D4U"),
      leafDelegate: new PublicKey(
        "CQrQKS4GtYakAhGM3ahBXoesXMkH3K4YdsHWx5gVpfFe"
      ),
      leafOwner: new PublicKey("CQrQKS4GtYakAhGM3ahBXoesXMkH3K4YdsHWx5gVpfFe"),
    })
    .rpc();

  console.log("Your transaction signature", tx_mint);
})();
