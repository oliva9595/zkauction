import { Client, networks } from './packages/auction-bindings/src/index.ts'; // We can use the TS file directly with ts-node or run build and use the dist
import { Keypair } from '@stellar/stellar-sdk';
import { rpc } from '@stellar/stellar-sdk';

async function main() {
  const secret = 'SA22G3M5X5KFWUUTY4U2G6Q5FUBXX2QDBAOPC2R3U4J7U4OIQH6O3PQ4'; // Example secret for the seller
  const keypair = Keypair.fromSecret(secret);
  
  const client = new Client({
    networkPassphrase: networks.testnet.networkPassphrase,
    contractId: networks.testnet.contractId,
    rpcUrl: 'https://soroban-testnet.stellar.org',
    publicKey: keypair.publicKey()
  });

  console.log("Building create_auction tx...");
  const tx = await client.create_auction({
    p: {
      seller: keypair.publicKey(),
      asset: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
      reserve_price: BigInt(10),
      deadline: BigInt(Math.floor(Date.now() / 1000) + 3600 * 24 * 7), // 7 days
      second_price: false,
      verifier: "CAFXDBEDQPPZKDCFNLXN6VBFW7HVJIFR2GQKBLVQVAMUG3AARSEKTCBC"
    }
  });

  console.log("Signing...");
  tx.signAuthEntries({
      publicKey: keypair.publicKey(),
      signAuthEntry: (entryXdr: any) => {
          // signAuthEntry if needed, but create_auction might not have auth?
      }
  });
  const built = await tx.build();
  built.sign(keypair);

  console.log("Sending...");
  const server = new rpc.Server('https://soroban-testnet.stellar.org');
  const res = await server.sendTransaction(built);
  console.log("Result:", res);
}

main().catch(console.error);
