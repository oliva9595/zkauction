import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
        contractId: "CBLIX3VYZTOF6YMEQBMI2ERCZVOJY6AE374UDEWRXELGDXKOZE5EA3GV",
    }
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAAAAAAAGc2V0dGxlAAAAAAAEAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAGAAAAAAAAAApwcm9vZl9ibG9iAAAAAAAOAAAAAAAAAAx3aW5uZXJfaW5kZXgAAAAEAAAAAAAAAA5jbGVhcmluZ19wcmljZQAAAAAACwAAAAA=",
            "AAAAAgAAAAAAAAAAAAAABlN0YXR1cwAAAAAAAwAAAAAAAAAAAAAABE9wZW4AAAAAAAAAAAAAAAZDbG9zZWQAAAAAAAAAAAAAAAAAB1NldHRsZWQA",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABgAAAAEAAAAAAAAAB0F1Y3Rpb24AAAAAAQAAAAYAAAABAAAAAAAAAAZDb21taXQAAAAAAAIAAAAGAAAABAAAAAEAAAAAAAAABUNvdW50AAAAAAAAAQAAAAYAAAABAAAAAAAAAAZTdGF0dXMAAAAAAAEAAAAGAAAAAQAAAAAAAAAHU2V0dGxlZAAAAAABAAAD7gAAACAAAAAAAAAAAAAAAAVOb25jZQAAAA==",
            "AAAAAAAAAAAAAAAKY29tbWl0X2JpZAAAAAAABAAAAAAAAAAKYXVjdGlvbl9pZAAAAAAABgAAAAAAAAAGYmlkZGVyAAAAAAATAAAAAAAAAApjb21taXRtZW50AAAAAAPuAAAAIAAAAAAAAAAGZXNjcm93AAAAAAALAAAAAQAAAAQ=",
            "AAAAAAAAAAAAAAAOY3JlYXRlX2F1Y3Rpb24AAAAAAAEAAAAAAAAAAXAAAAAAAAfQAAAADUF1Y3Rpb25QYXJhbXMAAAAAAAABAAAABg==",
            "AAAAAAAAAAAAAAAOZ2V0X2NvbW1pdG1lbnQAAAAAAAIAAAAAAAAACmF1Y3Rpb25faWQAAAAAAAYAAAAAAAAABWluZGV4AAAAAAAABAAAAAEAAAPuAAAAIA==",
            "AAAAAQAAAAAAAAAAAAAADUF1Y3Rpb25QYXJhbXMAAAAAAAAGAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAANcmVzZXJ2ZV9wcmljZQAAAAAAAAsAAAAAAAAADHNlY29uZF9wcmljZQAAAAEAAAAAAAAABnNlbGxlcgAAAAAAEwAAAAAAAAAIdmVyaWZpZXIAAAAT",
            "AAAAAAAAAAAAAAASY2xvc2VfY29tbWl0X3BoYXNlAAAAAAABAAAAAAAAAAphdWN0aW9uX2lkAAAAAAAGAAAAAA=="]), options);
        this.options = options;
    }
    fromJSON = {
        settle: (this.txFromJSON),
        commit_bid: (this.txFromJSON),
        create_auction: (this.txFromJSON),
        get_commitment: (this.txFromJSON),
        close_commit_phase: (this.txFromJSON)
    };
}
