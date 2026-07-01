import { Client } from './auctionClient';

export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export const AUCTION_CONTRACT_ID = 'CAKDGU5BFBHR675MJEEA6UQOJ2RL342D5LGU4FYTDGLI4LL4I7UFLSV6';
export const NATIVE_TOKEN_CONTRACT_ID = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
export const VERIFIED_AUCTION_ID = BigInt(1);
export const READONLY_PUBLIC_KEY = 'GB4W3UIOBSERQ45D5KU2L56WN4CZJBOKR7KXUH4QFCW2TACCZJOOBH43';

export const auctionClient = new Client({
  networkPassphrase: NETWORK_PASSPHRASE,
  contractId: AUCTION_CONTRACT_ID,
  rpcUrl: RPC_URL,
  publicKey: READONLY_PUBLIC_KEY,
});

export const getAuctionClient = (publicKey: string) =>
  new Client({
    networkPassphrase: NETWORK_PASSPHRASE,
    contractId: AUCTION_CONTRACT_ID,
    rpcUrl: RPC_URL,
    publicKey,
  });

export const TESTNET_EXPLORER_BASE = 'https://stellar.expert/explorer/testnet';

export const TESTNET_EVIDENCE = {
  deployTx: 'be172f8cd502429c0c747fc8844c556b21e6c30ca7bbea8d921a0bf7f9dc042a',
  createAuctionTx: '336eaa1995148ab931a442d833c443edf2ce40002279c3796c696358a28089e5',
  bidder1CommitTx: 'c3ed14555da0195c674f51ca50c72486245d02dc69cc5dbb70a2956935d9e634',
  bidder2CommitTx: '79fa69c042136ad6ed2ae8d3bfafddd46d3bf4419aaeee0c452d809d9a7fc031',
  bidder3CommitTx: '74267b1ce16100a0b694ab646291da87646a3272837427354a4ee0797f346388',
  closeTx: 'ce0cb4641efadd8e0bb744b1733727b10f99ee19c4c6dfbb023654839ef61d57',
  settleTx: '48e7da6972244096ce0193007d1dbaaf97c80f985314f1cb762365460792865d',
  proofSha256: '7ae60f32d9df8a596db541c731f92690823e23ab0b2bff5485b45098296d500d',
  vkSha256: 'e42da8f83e29e7ff858d2556c90ea8e400bf345c59c8d4eafc75470b77610b69',
} as const;
