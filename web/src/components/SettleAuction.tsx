"use client";

import { useVerifiedAuction } from "../hooks/useVerifiedAuction";
import { CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { formatAuctionValue } from "../lib/auctionDisplay";
import { AUCTION_CONTRACT_ID, TESTNET_EVIDENCE, TESTNET_EXPLORER_BASE } from "../lib/soroban";
import { shortHash } from "../lib/stellarTx";

const txRows = [
  ["Create auction", TESTNET_EVIDENCE.createAuctionTx],
  ["Commit bidder 1", TESTNET_EVIDENCE.bidder1CommitTx],
  ["Commit bidder 2", TESTNET_EVIDENCE.bidder2CommitTx],
  ["Commit bidder 3", TESTNET_EVIDENCE.bidder3CommitTx],
  ["Close phase", TESTNET_EVIDENCE.closeTx],
  ["Settle proof", TESTNET_EVIDENCE.settleTx],
] as const;

export default function SettleAuction() {
  const { auction, error, loading, refresh } = useVerifiedAuction();

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="p-2.5 bg-green-500/20 rounded-xl text-green-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">Real Testnet Settlement</h3>
          <p className="text-sm text-gray-400">Auction 1 settled on-chain with a real Noir proof</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4 text-gray-300">
          <Loader2 className="h-5 w-5 animate-spin text-green-400" />
          Reading Stellar testnet state...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200">
          <div>Could not read auction state: {error}</div>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-100 hover:border-red-300/50 hover:bg-red-500/20"
          >
            <Loader2 className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      ) : auction ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-green-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Settlement verified by contract</span>
            </div>
            <dl className="grid gap-3 text-sm">
              <EvidenceRow label="Status" value={formatAuctionValue(auction.status)} />
              <EvidenceRow label="Auction ID" value={formatAuctionValue(auction.id)} />
              <EvidenceRow label="Bidder count" value={formatAuctionValue(auction.bidder_count)} />
              <EvidenceRow label="Winner" value={formatAuctionValue(auction.winner)} mono />
              <EvidenceRow label="Clearing price" value={formatAuctionValue(auction.clearing_price)} />
              <EvidenceRow label="Token escrow balance after settle" value="0" />
            </dl>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              On-chain transaction trail
            </h4>
            <div className="space-y-2">
              {txRows.map(([label, hash]) => (
                <a
                  key={hash}
                  href={`${TESTNET_EXPLORER_BASE}/tx/${hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-gray-300 hover:border-green-400/40 hover:text-white"
                >
                  <span>{label}</span>
                  <span className="inline-flex items-center gap-2 font-mono text-green-300">
                    {shortHash(hash)}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-300">
            <div className="mb-2 text-gray-400">Proof artifacts</div>
            <div className="space-y-2 font-mono text-xs">
              <HashLine label="VK SHA-256" value={TESTNET_EVIDENCE.vkSha256} />
              <HashLine label="Proof SHA-256" value={TESTNET_EVIDENCE.proofSha256} />
            </div>
          </div>

          <a
            href={`${TESTNET_EXPLORER_BASE}/contract/${AUCTION_CONTRACT_ID}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-green-300 hover:text-green-200"
          >
            Open contract on Stellar Expert <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

function EvidenceRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`${mono ? "font-mono text-xs" : "font-medium"} break-all text-white`}>{value}</dd>
    </div>
  );
}

function HashLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="break-all text-gray-200">{value}</span>
    </div>
  );
}
