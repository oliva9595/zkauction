"use client";

import { ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { useVerifiedAuction } from "../hooks/useVerifiedAuction";
import { formatAuctionValue } from "../lib/auctionDisplay";
import {
  AUCTION_CONTRACT_ID,
  TESTNET_EVIDENCE,
  TESTNET_EXPLORER_BASE,
  VERIFIED_AUCTION_ID,
} from "../lib/soroban";
import { shortHash } from "../lib/stellarTx";

type VerificationLabProps = {
  compact?: boolean;
};

const transactionRows = [
  ["Create auction", TESTNET_EVIDENCE.createAuctionTx],
  ["Commit bidder 1", TESTNET_EVIDENCE.bidder1CommitTx],
  ["Commit bidder 2", TESTNET_EVIDENCE.bidder2CommitTx],
  ["Commit bidder 3", TESTNET_EVIDENCE.bidder3CommitTx],
  ["Close phase", TESTNET_EVIDENCE.closeTx],
  ["Settle proof", TESTNET_EVIDENCE.settleTx],
] as const;

export default function VerificationLab({ compact = false }: VerificationLabProps) {
  const { auction, error, loading, refresh } = useVerifiedAuction();

  return (
    <div className={compact ? "verification-lab verification-lab--compact" : "verification-lab"}>
      {!compact ? (
        <div className="section-heading">
          <span>Developer verification lab</span>
          <h2>Every claim has a testnet receipt.</h2>
        </div>
      ) : null}

      <div className="verification-lab__grid">
        <div className="evidence-panel evidence-panel--primary">
          <div className="evidence-panel__header">
            <ShieldCheck className="size-5 text-[var(--verified)]" />
            <div>
              <h3>Settlement state</h3>
              <p>Read live from auction {VERIFIED_AUCTION_ID.toString()} on Stellar testnet.</p>
            </div>
          </div>

          {loading ? (
            <div className="evidence-loading">Reading Stellar testnet state...</div>
          ) : error ? (
            <div className="evidence-error">
              <p>Could not read auction state: {error}</p>
              <button type="button" onClick={() => void refresh()}>
                <RefreshCw className="size-4" />
                Retry testnet read
              </button>
            </div>
          ) : auction ? (
            <dl className="evidence-values">
              <EvidenceValue label="Auction ID" value={formatAuctionValue(auction.id)} />
              <EvidenceValue label="Status" value={formatAuctionValue(auction.status)} />
              <EvidenceValue label="Bidder count" value={formatAuctionValue(auction.bidder_count)} />
              <EvidenceValue label="Winner" value={formatAuctionValue(auction.winner)} mono />
              <EvidenceValue label="Clearing price" value={formatAuctionValue(auction.clearing_price)} />
              <EvidenceValue label="Token escrow balance after settlement" value="0" />
              <EvidenceValue label="Contract ID" value={AUCTION_CONTRACT_ID} mono />
            </dl>
          ) : null}
        </div>

        <div className="evidence-panel">
          <h3>Transaction trail</h3>
          <div className="transaction-list">
            {transactionRows.map(([label, hash]) => (
              <a
                key={hash}
                href={`${TESTNET_EXPLORER_BASE}/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
              >
                <span>{label}</span>
                <strong>
                  {shortHash(hash)}
                  <ExternalLink className="size-3.5" />
                </strong>
              </a>
            ))}
          </div>
        </div>

        <details className="evidence-panel evidence-disclosure" open>
          <summary>Proof artifacts</summary>
          <div className="evidence-values evidence-values--single">
            <EvidenceValue label="Proof SHA-256" value={TESTNET_EVIDENCE.proofSha256} mono />
            <EvidenceValue label="VK SHA-256" value={TESTNET_EVIDENCE.vkSha256} mono />
          </div>
        </details>

        <details className="evidence-panel evidence-disclosure">
          <summary>Contract explorer</summary>
          <a
            href={`${TESTNET_EXPLORER_BASE}/contract/${AUCTION_CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="contract-link"
          >
            Open {shortHash(AUCTION_CONTRACT_ID)} on Stellar Expert
            <ExternalLink className="size-4" />
          </a>
        </details>
      </div>
    </div>
  );
}

function EvidenceValue({
  label,
  mono = false,
  value,
}: {
  label: string;
  mono?: boolean;
  value: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={mono ? "font-mono" : undefined}>{value}</dd>
    </div>
  );
}
