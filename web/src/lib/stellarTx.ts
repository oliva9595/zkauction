import type { AssembledTransaction } from "@stellar/stellar-sdk/contract";
import type { Api } from "@stellar/stellar-sdk/rpc";
import { NETWORK_PASSPHRASE } from "./soroban";

export type SentTxSummary<T> = {
  hash: string;
  result: T;
  status?: string;
};

export async function getFreighterAddress() {
  const { getAddress } = await import("@stellar/freighter-api");
  const { address, error } = await getAddress();

  if (error) {
    throw new Error(formatFreighterError(error));
  }
  if (!address) {
    throw new Error("Connect Freighter first.");
  }

  return address;
}

export async function signAndSend<T>(
  tx: AssembledTransaction<T>,
  onStatus?: (message: string) => void,
): Promise<SentTxSummary<T>> {
  const { signTransaction } = await import("@stellar/freighter-api");

  const sent = await tx.signAndSend({
    signTransaction: async (xdr, opts) => {
      const result = await signTransaction(xdr, {
        ...opts,
        networkPassphrase: NETWORK_PASSPHRASE,
      });

      if (result.error) {
        throw new Error(formatFreighterError(result.error));
      }

      return {
        signedTxXdr: result.signedTxXdr,
        signerAddress: result.signerAddress,
      };
    },
    watcher: {
      onSubmitted(response?: Api.SendTransactionResponse) {
        if (response?.hash) {
          onStatus?.(`Submitted ${shortHash(response.hash)}`);
        }
      },
      onProgress(response?: Api.GetTransactionResponse) {
        if (response?.status) {
          onStatus?.(`Ledger status: ${response.status}`);
        }
      },
    },
  });

  const hash = sent.sendTransactionResponse?.hash;
  if (!hash) {
    throw new Error("Transaction was sent, but RPC did not return a hash.");
  }

  return {
    hash,
    result: sent.result,
    status: sent.getTransactionResponse?.status,
  };
}

export function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}

export function formatFreighterError(error: unknown) {
  if (!error) return "Unknown Freighter error";
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return JSON.stringify(error);
}
