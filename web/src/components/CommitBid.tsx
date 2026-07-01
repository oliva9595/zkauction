"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ExternalLink, Loader2, Lock, RefreshCw } from "lucide-react";
import { getAuctionClient, NETWORK_PASSPHRASE, TESTNET_EXPLORER_BASE } from "../lib/soroban";
import { getFreighterAddress, signAndSend, shortHash } from "../lib/stellarTx";

type CommitBidProps = {
  activeAuctionId: bigint | null;
};

export default function CommitBid({ activeAuctionId }: CommitBidProps) {
  const [bid, setBid] = useState("");
  const [blinding, setBlinding] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [hash, setHash] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTx, setSubmittedTx] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Initialize blinding on client side only
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBlinding(Math.floor(Math.random() * 1000000000).toString());
  }, []);

  const handleHash = async () => {
    setIsHashing(true);

    try {
      const input = new TextEncoder().encode(`${bid}:${blinding}:${NETWORK_PASSPHRASE}`);
      const digest = await crypto.subtle.digest("SHA-256", input);
      const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
      setHash(`0x${hex}`);
    } finally {
      setIsHashing(false);
    }
  };

  const handleSubmit = async () => {
    if (!hash || activeAuctionId === null) return;
    setIsSubmitting(true);
    setTxStatus("Preparing transaction");
    
    try {
      const { Buffer } = await import('buffer');
      const pubKey = await getFreighterAddress();
      const client = getAuctionClient(pubKey);

      const commitmentBuf = Buffer.from(hash.replace("0x", ""), "hex");
      const escrowAmount = BigInt(parseInt(bid) || 0);
      
      const tx = await client.commit_bid({
        auction_id: activeAuctionId,
        bidder: pubKey,
        commitment: commitmentBuf,
        escrow_amount: escrowAmount
      }, { publicKey: pubKey });
      
      const sent = await signAndSend(tx, setTxStatus);
      setSubmittedTx(sent.hash);
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error) {
        setTxStatus(`Error: ${e.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedTx) {
    return (
      <div className="workspace-card workspace-card--success">
        <div className="workspace-success-icon">
          <CheckCircle2 className="size-8" />
        </div>
        <h3>Bid Committed</h3>
        <p>
          Your commitment and escrow were submitted to Stellar testnet. Keep your blinding factor safe.
        </p>
        <div className="commit-hash">
          <div>Your Hash (Public)</div>
          <code>{hash}</code>
        </div>
        <a
          href={`${TESTNET_EXPLORER_BASE}/tx/${submittedTx}`}
          target="_blank"
          rel="noreferrer"
          className="workspace-link"
        >
          View tx {shortHash(submittedTx)} <ExternalLink className="size-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="workspace-card">
      <div className="workspace-card__header">
        <div className="workspace-card__icon">
          <Lock className="size-5" />
        </div>
        <div>
          <h3>Commit Your Bid</h3>
          <p>
            Commits escrow on Stellar testnet using the active auction ID
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="workspace-status-box">
          Active auction:{" "}
          <code>
            {activeAuctionId === null ? "Create one first" : activeAuctionId.toString()}
          </code>
        </div>

        <div>
          <label className="workspace-label">Escrow Amount (native testnet token)</label>
          <div className="relative">
            <input
              type="number"
              value={bid}
              onChange={(e) => { setBid(e.target.value); setHash(null); }}
              placeholder="e.g. 100"
              className="workspace-input pr-20"
            />
            <div className="workspace-input-unit">stroops</div>
          </div>
        </div>

        <div>
          <label className="workspace-label flex justify-between">
            <span>Secret Blinding Factor</span>
            <button 
              type="button"
              onClick={() => { setBlinding(Math.floor(Math.random() * 1000000000).toString()); setHash(null); }}
              className="workspace-inline-action"
            >
              <RefreshCw className="size-3.5" />
              Regenerate
            </button>
          </label>
          <input
            type="text"
            value={blinding}
            onChange={(e) => { setBlinding(e.target.value); setHash(null); }}
            className="workspace-input font-mono text-sm"
          />
        </div>

        {!hash ? (
          <button
            type="button"
            onClick={handleHash}
            disabled={!bid || isHashing}
            className="workspace-secondary-action"
          >
            {isHashing ? <Loader2 className="size-5 animate-spin" /> : "Calculate Browser Commitment"}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="commit-hash">
              <div>Browser Commitment Hash</div>
              <code>{hash}</code>
            </div>
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || activeAuctionId === null}
              className="workspace-primary-action"
            >
              {isSubmitting ? (
                <><Loader2 className="size-5 animate-spin" /> Submitting to Testnet...</>
              ) : (
                "Submit Commitment + Escrow"
              )}
            </button>
            {txStatus && <p className="workspace-status">{txStatus}</p>}
          </div>
        )}
        <p className="workspace-note">
          This browser hash is an on-chain commitment demo. The completed settlement evidence below uses the real Noir proof generated by the local Barretenberg pipeline.
        </p>
      </div>
    </div>
  );
}
