/* eslint-disable */
import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAKDGU5BFBHR675MJEEA6UQOJ2RL342D5LGU4FYTDGLI4LL4I7UFLSV6",
  }
} as const

export type Error = {tag: "AlreadyInitialized", values: void} | {tag: "NotInitialized", values: void} | {tag: "AuctionMissing", values: void} | {tag: "NotClosed", values: void} | {tag: "NotOpen", values: void} | {tag: "PastDeadline", values: void} | {tag: "TooEarlyToClose", values: void} | {tag: "AlreadySettled", values: void} | {tag: "InvalidCommitment", values: void} | {tag: "AuctionFull", values: void} | {tag: "VerificationFailed", values: void} | {tag: "VkParseError", values: void} | {tag: "EmptyProof", values: void} | {tag: "InvalidEscrow", values: void} | {tag: "InsufficientEscrow", values: void};

export type Status = {tag: "Open", values: void} | {tag: "Closed", values: void} | {tag: "Settled", values: void};

export interface AuctionData {
  bidder_count: u32;
  clearing_price: Option<u64>;
  id: u64;
  params: AuctionParams;
  status: Status;
  winner: Option<string>;
}

export interface AuctionParams {
  deadline: u64;
  reserve_price: u64;
  second_price: boolean;
  seller: string;
  token: string;
}

export interface Client {
  /**
   * Construct and simulate a settle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  settle: ({auction_id, proof, winner_index, clearing_price}: {auction_id: u64, proof: Buffer, winner_index: u32, clearing_price: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a commit_bid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  commit_bid: ({auction_id, bidder, commitment, escrow_amount}: {auction_id: u64, bidder: string, commitment: Buffer, escrow_amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_auction transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_auction: ({auction_id}: {auction_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<AuctionData>>

  /**
   * Construct and simulate a create_auction transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_auction: ({p}: {p: AuctionParams}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_commitment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_commitment: ({auction_id, index}: {auction_id: u64, index: u32}, options?: MethodOptions) => Promise<AssembledTransaction<readonly [string, Buffer, i128]>>

  /**
   * Construct and simulate a close_commit_phase transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  close_commit_phase: ({auction_id}: {auction_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a pack_public_inputs_view transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  pack_public_inputs_view: ({auction_id, winner_index, clearing_price}: {auction_id: u64, winner_index: u32, clearing_price: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Buffer>>
}

export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAADQAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAOQXVjdGlvbk1pc3NpbmcAAAAAAAMAAAAAAAAACU5vdENsb3NlZAAAAAAAAAQAAAAAAAAAB05vdE9wZW4AAAAABQAAAAAAAAAMUGFzdERlYWRsaW5lAAAABgAAAAAAAAAPVG9vRWFybHlUb0Nsb3NlAAAAAAcAAAAAAAAADkFscmVhZHlTZXR0bGVkAAAAAAAIAAAAAAAAABFJbnZhbGlkQ29tbWl0bWVudAAAAAAAAAkAAAAAAAAAC0F1Y3Rpb25GdWxsAAAAAAoAAAAAAAAAElZlcmlmaWNhdGlvbkZhaWxlZAAAAAAACwAAAAAAAAAMVmtQYXJzZUVycm9yAAAADAAAAAAAAAAKRW1wdHlQcm9vZgAAAAAADQ==",
        "AAAAAgAAAAAAAAAAAAAABlN0YXR1cwAAAAAAAwAAAAAAAAAAAAAABE9wZW4AAAAAAAAAAAAAAAZDbG9zZWQAAAAAAAAAAAAAAAAAB1NldHRsZWQA",
        "AAAAAQAAAAAAAAAAAAAAC0F1Y3Rpb25EYXRhAAAAAAYAAAAAAAAADGJpZGRlcl9jb3VudAAAAAQAAAAAAAAADmNsZWFyaW5nX3ByaWNlAAAAAAPoAAAABgAAAAAAAAACaWQAAAAAAAYAAAAAAAAABnBhcmFtcwAAAAAH0AAAAA1BdWN0aW9uUGFyYW1zAAAAAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAGU3RhdHVzAAAAAAAAAAAABndpbm5lcgAAAAAD6AAAABM=",
        "AAAAAQAAAAAAAAAAAAAADUF1Y3Rpb25QYXJhbXMAAAAAAAAFAAAAAAAAAAhkZWFkbGluZQAAAAYAAAAAAAAADXJlc2VydmVfcHJpY2UAAAAAAAAGAAAAAAAAAAxzZWNvbmRfcHJpY2UAAAABAAAAAAAAAAZzZWxsZXIAAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEw==",
        "AAAAAAAAAAAAAAAGc2V0dGxlAAAAAAAEAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAGAAAAAAAAAAVwcm9vZgAAAAAAAA4AAAAAAAAADHdpbm5lcl9pbmRleAAAAAQAAAAAAAAADmNsZWFyaW5nX3ByaWNlAAAAAAAGAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAKY29tbWl0X2JpZAAAAAAABAAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABgAAAAAAAAAGYmlkZGVyAAAAAAATAAAAAAAAAApjb21taXRtZW50AAAAAAPuAAAAIAAAAAAAAAANZXNjcm93X2Ftb3VudAAAAAAAAAsAAAABAAAD6QAAAAQAAAAD",
        "AAAAAAAAAAAAAAALZ2V0X2F1Y3Rpb24AAAAAAQAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABgAAAAEAAAPpAAAH0AAAAAtBdWN0aW9uRGF0YQAAAAAD",
        "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAIdmtfYnl0ZXMAAAAOAAAAAA==",
        "AAAAAAAAAAAAAAAOY3JlYXRlX2F1Y3Rpb24AAAAAAAEAAAAAAAAABnBhcmFtcwAAAAAH0AAAAA1BdWN0aW9uUGFyYW1zAAAAAAAAAQAAA+kAAAAGAAAAAw==",
        "AAAAAAAAAAAAAAAOZ2V0X2NvbW1pdG1lbnQAAAAAAAIAAAAAAAAACmF1Y3Rpb25faWQAAAAAAAYAAAAAAAAABWluZGV4AAAAAAAABAAAAAEAAAPpAAAD7QAAAAMAAAATAAAD7gAAACAAAAALAAAAAw==",
        "AAAAAAAAAAAAAAASY2xvc2VfY29tbWl0X3BoYXNlAAAAAAABAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAGAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAXcGFja19wdWJsaWNfaW5wdXRzX3ZpZXcAAAAAAwAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABgAAAAAAAAAMd2lubmVyX2luZGV4AAAABAAAAAAAAAAOY2xlYXJpbmdfcHJpY2UAAAAAAAYAAAABAAAD6QAAAA4AAAAD"
      ]),
      options
    )
  }
  public readonly fromJSON = {
    settle: this.txFromJSON<null>,
    commit_bid: this.txFromJSON<u32>,
    get_auction: this.txFromJSON<AuctionData>,
    create_auction: this.txFromJSON<u64>,
    get_commitment: this.txFromJSON<readonly [string, Buffer, i128]>,
    close_commit_phase: this.txFromJSON<null>,
    pack_public_inputs_view: this.txFromJSON<Buffer>
  }
}
