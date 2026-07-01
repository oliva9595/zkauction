"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Plus, ShieldCheck } from "lucide-react";
import CommitBid from "./CommitBid";
import SettleAuction from "./SettleAuction";
import {
  AUCTION_CONTRACT_ID,
  getAuctionClient,
  NATIVE_TOKEN_CONTRACT_ID,
  TESTNET_EXPLORER_BASE,
  VERIFIED_AUCTION_ID,
} from "../lib/soroban";
import { getFreighterAddress, signAndSend, shortHash } from "../lib/stellarTx";

type WorkspaceMode = "create" | "commit" | "settlement";

const labels: Record<WorkspaceMode, string> = {
  create: "Create",
  commit: "Commit",
  settlement: "Settlement",
};

export default function DemoWorkspace() {
  const [activeMode, setActiveMode] = useState<WorkspaceMode>("create");
  const [activeAuctionId, setActiveAuctionId] = useState<bigint | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState<string | null>(null);
  const [createTx, setCreateTx] = useState<string | null>(null);

  const createAuction = async () => {
    setIsCreating(true);
    setCreateStatus("Preparing transaction");
    setCreateTx(null);

    try {
      const pubKey = await getFreighterAddress();
      const client = getAuctionClient(pubKey);
      const tx = await client.create_auction(
        {
          p: {
            seller: pubKey,
            token: NATIVE_TOKEN_CONTRACT_ID,
            reserve_price: BigInt(10),
            second_price: true,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
          },
        },
        { publicKey: pubKey },
      );

      const sent = await signAndSend(tx, setCreateStatus);
      setActiveAuctionId(sent.result);
      setCreateTx(sent.hash);
      setCreateStatus(`Created auction ${sent.result.toString()}`);
      setActiveMode("commit");
    } catch (err) {
      setCreateStatus(err instanceof Error ? `Error: ${err.message}` : String(err));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="demo-workspace">
      <div className="demo-workspace__intro">
        <div>
          <span>Live demo</span>
          <h2>Run the auction path, then inspect the settled proof.</h2>
        </div>
        <a
          href={`${TESTNET_EXPLORER_BASE}/contract/${AUCTION_CONTRACT_ID}`}
          target="_blank"
          rel="noreferrer"
        >
          Contract {shortHash(AUCTION_CONTRACT_ID)}
          <ExternalLink className="size-4" />
        </a>
      </div>

      <div className="workspace-tabs" role="tablist" aria-label="Auction demo steps">
        {(["create", "commit", "settlement"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={activeMode === mode}
            onClick={() => setActiveMode(mode)}
          >
            {labels[mode]}
          </button>
        ))}
      </div>

      <div className="demo-workspace__panel">
        {activeMode === "create" ? (
          <CreateAuctionPanel
            activeAuctionId={activeAuctionId}
            createAuction={createAuction}
            createStatus={createStatus}
            createTx={createTx}
            isCreating={isCreating}
          />
        ) : null}
        {activeMode === "commit" ? <CommitBid activeAuctionId={activeAuctionId} /> : null}
        {activeMode === "settlement" ? <SettleAuction /> : null}
      </div>
    </div>
  );
}

function CreateAuctionPanel({
  activeAuctionId,
  createAuction,
  createStatus,
  createTx,
  isCreating,
}: {
  activeAuctionId: bigint | null;
  createAuction: () => void;
  createStatus: string | null;
  createTx: string | null;
  isCreating: boolean;
}) {
  return (
    <div className="workspace-card">
      <div className="workspace-card__header">
        <div className="workspace-card__icon">
          <Plus className="size-5" />
        </div>
        <div>
          <h3>Create Live Test Auction</h3>
          <p>
            Creates a fresh one-hour auction using native Stellar testnet token escrow.
          </p>
        </div>
      </div>

      <dl className="workspace-facts">
        <div>
          <dt>Reserve price</dt>
          <dd>10 stroops</dd>
        </div>
        <div>
          <dt>Pricing</dt>
          <dd>Second-price</dd>
        </div>
        <div>
          <dt>Verified baseline</dt>
          <dd>Auction {VERIFIED_AUCTION_ID.toString()} settled</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={createAuction}
        disabled={isCreating}
        className="workspace-primary-action"
      >
        {isCreating ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
        {isCreating ? "Submitting to Testnet..." : "Create Auction On-Chain"}
      </button>

      {createStatus ? <p className="workspace-status">{createStatus}</p> : null}
      {activeAuctionId !== null ? (
        <p className="workspace-status">
          Active auction ID: <code>{activeAuctionId.toString()}</code>
        </p>
      ) : null}
      {createTx ? (
        <a
          href={`${TESTNET_EXPLORER_BASE}/tx/${createTx}`}
          target="_blank"
          rel="noreferrer"
          className="workspace-link"
        >
          View tx {shortHash(createTx)}
          <ExternalLink className="size-4" />
        </a>
      ) : null}
    </div>
  );
}
