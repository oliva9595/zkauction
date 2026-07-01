"use client";

import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import type { AuctionData } from "../lib/auctionClient";
import { formatAuctionValue } from "../lib/auctionDisplay";

type SettlementReceiptProps = {
  auction: AuctionData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export default function SettlementReceipt({
  auction,
  loading,
  error,
  onRetry,
}: SettlementReceiptProps) {
  return (
    <aside className="settlement-receipt" aria-label="Live settlement receipt">
      <div className="settlement-receipt__header">
        <span>Live receipt</span>
        <strong>Stellar testnet</strong>
      </div>

      {loading ? (
        <div className="settlement-receipt__state">
          <Loader2 className="size-4 animate-spin text-[var(--verified)]" />
          <span>Reading Stellar testnet state</span>
        </div>
      ) : error ? (
        <div className="settlement-receipt__state settlement-receipt__state--error">
          <span>Settlement evidence temporarily unavailable</span>
          <button type="button" onClick={onRetry}>
            <RefreshCw className="size-3.5" />
            Retry
          </button>
        </div>
      ) : auction ? (
        <>
          <div className="settlement-receipt__verified">
            <CheckCircle2 className="size-4" />
            <span>{formatAuctionValue(auction.status)}</span>
          </div>
          <dl className="settlement-receipt__grid">
            <ReceiptValue label="Clearing price" value={formatAuctionValue(auction.clearing_price)} />
            <ReceiptValue label="Bidder count" value={formatAuctionValue(auction.bidder_count)} />
            <ReceiptValue label="Escrow released" value="100%" />
            <ReceiptValue label="Auction ID" value={formatAuctionValue(auction.id)} />
          </dl>
          <div className="settlement-receipt__winner">
            <span>Winner</span>
            <code>{formatAuctionValue(auction.winner)}</code>
          </div>
        </>
      ) : (
        <div className="settlement-receipt__state">No auction state returned</div>
      )}
    </aside>
  );
}

function ReceiptValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
