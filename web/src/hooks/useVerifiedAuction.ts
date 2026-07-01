"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuctionData } from "../lib/auctionClient";
import { unwrapAuctionResult } from "../lib/auctionDisplay";
import { auctionClient, VERIFIED_AUCTION_ID } from "../lib/soroban";

export function useVerifiedAuction() {
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const tx = await auctionClient.get_auction({ auction_id: VERIFIED_AUCTION_ID });
      setAuction(unwrapAuctionResult(tx.result));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [refresh]);

  return { auction, error, loading, refresh };
}
