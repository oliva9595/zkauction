import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u32, u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CBLIX3VYZTOF6YMEQBMI2ERCZVOJY6AE374UDEWRXELGDXKOZE5EA3GV";
    };
};
export type Status = {
    tag: "Open";
    values: void;
} | {
    tag: "Closed";
    values: void;
} | {
    tag: "Settled";
    values: void;
};
export type DataKey = {
    tag: "Auction";
    values: readonly [u64];
} | {
    tag: "Commit";
    values: readonly [u64, u32];
} | {
    tag: "Count";
    values: readonly [u64];
} | {
    tag: "Status";
    values: readonly [u64];
} | {
    tag: "Settled";
    values: readonly [Buffer];
} | {
    tag: "Nonce";
    values: void;
};
export interface AuctionParams {
    asset: string;
    deadline: u64;
    reserve_price: i128;
    second_price: boolean;
    seller: string;
    verifier: string;
}
export interface Client {
    /**
     * Construct and simulate a settle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    settle: ({ auction_id, proof_blob, winner_index, clearing_price }: {
        auction_id: u64;
        proof_blob: Buffer;
        winner_index: u32;
        clearing_price: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a commit_bid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    commit_bid: ({ auction_id, bidder, commitment, escrow }: {
        auction_id: u64;
        bidder: string;
        commitment: Buffer;
        escrow: i128;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a create_auction transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_auction: ({ p }: {
        p: AuctionParams;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a get_commitment transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_commitment: ({ auction_id, index }: {
        auction_id: u64;
        index: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Buffer>>;
    /**
     * Construct and simulate a close_commit_phase transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    close_commit_phase: ({ auction_id }: {
        auction_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        settle: (json: string) => AssembledTransaction<null>;
        commit_bid: (json: string) => AssembledTransaction<number>;
        create_auction: (json: string) => AssembledTransaction<bigint>;
        get_commitment: (json: string) => AssembledTransaction<Buffer>;
        close_commit_phase: (json: string) => AssembledTransaction<null>;
    };
}
