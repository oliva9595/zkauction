"use client";

import { useEffect, useState } from "react";
import {
  getAddress,
  isAllowed,
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";
import { Wallet } from "lucide-react";
import { formatFreighterError } from "../lib/stellarTx";

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      const allowed = await isAllowed().catch(() => ({ isAllowed: false }));
      if (allowed.isAllowed) {
        const result = await getAddress();
        if (result.error) {
          setError(formatFreighterError(result.error));
          return;
        }
        if (result.address) {
          setAddress(result.address);
          setError(null);
        }
      }
    } catch {
      // Freighter is optional until the user starts an on-chain action.
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkConnection();
  }, []);

  const connect = async () => {
    setError(null);
    try {
      const connected = await isConnected();
      if (connected.error) {
        throw new Error(formatFreighterError(connected.error));
      }
      if (!connected.isConnected) {
        throw new Error("Freighter extension was not detected in this browser.");
      }

      const result = await requestAccess();
      if (result.error) {
        throw new Error(formatFreighterError(result.error));
      }
      if (!result.address) {
        throw new Error("Freighter did not return an address. Please unlock Freighter and approve access.");
      }

      setAddress(result.address);
    } catch (err) {
      const message = err instanceof Error ? err.message : formatFreighterError(err);
      setError(`${message} Please install/unlock Freighter, approve this site, and make sure Freighter is on Stellar Testnet.`);
    }
  };

  if (address) {
    return (
      <div className="flex h-8 min-w-0 items-center gap-2 rounded-[var(--control-radius)] border border-[var(--border)] bg-[var(--surface)] px-2.5">
        <Wallet className="size-3.5 shrink-0 text-[var(--verified)]" />
        <span className="truncate font-mono text-xs text-[var(--text-secondary)]">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex min-w-0 items-center">
      <button
        type="button"
        onClick={connect}
        aria-label="Connect Freighter"
        className="flex h-8 shrink-0 items-center gap-1.5 rounded-[var(--control-radius)] border border-[var(--text-primary)] bg-[var(--text-primary)] px-2.5 text-xs font-semibold text-[var(--canvas)] transition-colors hover:border-[var(--verified)] hover:bg-[var(--verified)]"
      >
        <Wallet className="size-3.5" />
        <span className="hidden min-[430px]:inline">Connect</span>
      </button>
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-[calc(100%+13px)] w-[min(20rem,calc(100vw-2rem))] rounded-[var(--control-radius)] border border-[var(--accent)] bg-[var(--surface-elevated)] px-3 py-2 text-right text-xs leading-5 text-[var(--text-primary)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
