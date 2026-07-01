"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import { useVerifiedAuction } from "../hooks/useVerifiedAuction";
import {
  AUCTION_CONTRACT_ID,
  TESTNET_EVIDENCE,
  TESTNET_EXPLORER_BASE,
} from "../lib/soroban";
import { shortHash } from "../lib/stellarTx";
import SettlementField from "./SettlementField";
import SettlementReceipt from "./SettlementReceipt";

export default function HeroSettlement() {
  const { auction, error, loading, refresh } = useVerifiedAuction();

  return (
    <section id="top" className="hero-settlement">
      <SettlementField />
      <div className="hero-settlement__inner">
        <div className="hero-settlement__copy">
          <span className="hero-settlement__eyebrow">
            <ShieldCheck className="size-4" />
            Real proof, real escrow, real settlement
          </span>
          <h1>
            Sealed by math.
            <br />
            Settled on Stellar.
          </h1>
          <p>
            A live end-to-end auction with private commitments, token escrow, a
            real Noir proof, and final settlement onchain.
          </p>
          <div className="hero-settlement__actions">
            <a className="button button--primary" href="#demo">
              Launch demo
            </a>
            <a className="button button--secondary" href="#evidence">
              View real evidence
            </a>
          </div>
        </div>

        <SettlementReceipt
          auction={auction}
          loading={loading}
          error={error}
          onRetry={() => void refresh()}
        />
      </div>
      <ProofDock />
    </section>
  );
}

function ProofDock() {
  const evidence: Array<{ label: string; value: string; href?: string }> = [
    {
      label: "Contract",
      value: shortHash(AUCTION_CONTRACT_ID),
      href: `${TESTNET_EXPLORER_BASE}/contract/${AUCTION_CONTRACT_ID}`,
    },
    {
      label: "Settlement tx",
      value: shortHash(TESTNET_EVIDENCE.settleTx),
      href: `${TESTNET_EXPLORER_BASE}/tx/${TESTNET_EVIDENCE.settleTx}`,
    },
    {
      label: "Proof SHA-256",
      value: shortHash(TESTNET_EVIDENCE.proofSha256),
    },
  ];

  return (
    <div className="proof-dock" aria-label="Proof evidence shortcuts">
      {evidence.map((item) =>
        item.href ? (
          <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
            <ProofDockItem label={item.label} value={item.value} linked />
          </a>
        ) : (
          <div key={item.label}>
            <ProofDockItem label={item.label} value={item.value} />
          </div>
        ),
      )}
    </div>
  );
}

function ProofDockItem({
  label,
  value,
  linked = false,
}: {
  label: string;
  value: string;
  linked?: boolean;
}) {
  return (
    <>
      <span>{label}</span>
      <strong>
        {value}
        {linked ? <ExternalLink className="size-3.5" aria-hidden="true" /> : null}
      </strong>
    </>
  );
}
