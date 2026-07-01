"use client";

import { useState } from "react";
import { ExternalLink, Gavel, Loader2, Trophy } from "lucide-react";
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

export default function AuctionDashboard() {
  const [phase, setPhase] = useState<"commit" | "settle">("commit");
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
    } catch (err) {
      setCreateStatus(err instanceof Error ? `Error: ${err.message}` : String(err));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Gavel className="w-8 h-8 text-purple-400" />
            zkAuction Testnet Demo
          </h2>
          <p className="text-gray-400 mt-2">
            Connected to the deployed Stellar testnet contract and a completed real-proof settlement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div id="evidence" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 min-w-[150px]">
            <div className="text-sm text-gray-400 mb-1">Contract</div>
            <a
              href={`${TESTNET_EXPLORER_BASE}/contract/${AUCTION_CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm text-purple-300 hover:text-purple-200"
            >
              {AUCTION_CONTRACT_ID.slice(0, 6)}...{AUCTION_CONTRACT_ID.slice(-4)}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 min-w-[150px]">
            <div className="text-sm text-gray-400 flex items-center gap-1.5 mb-1">
              <Trophy className="w-4 h-4" /> Evidence
            </div>
            <div className="text-lg font-medium text-purple-400">
              Auction {VERIFIED_AUCTION_ID.toString()} settled
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div id="protocol" className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 text-white">Onchain flow</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">1</span>
                <span>Create an open auction on the deployed testnet contract with your Freighter account.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">2</span>
                <span>Commit a sealed bid hash and native-token escrow on-chain.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">3</span>
                <span>Inspect the completed auction that was settled with a real Noir UltraHonk proof.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">4</span>
                <span>Follow every create, commit, close, and settle transaction in Stellar Expert.</span>
              </li>
            </ul>
          </div>

          <div id="demo" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <h3 className="mb-3 text-xl font-semibold text-white">Create Live Test Auction</h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              This creates a fresh one-hour testnet auction using the native asset contract. The returned auction ID becomes the target for the commit form.
            </p>
            <button
              onClick={createAuction}
              disabled={isCreating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-60"
            >
              {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {isCreating ? "Submitting to Testnet..." : "Create Auction On-Chain"}
            </button>
            {createStatus && <p className="mt-3 text-sm text-gray-400">{createStatus}</p>}
            {activeAuctionId !== null && (
              <p className="mt-2 text-sm text-gray-300">
                Active auction ID: <span className="font-mono text-white">{activeAuctionId.toString()}</span>
              </p>
            )}
            {createTx && (
              <a
                href={`${TESTNET_EXPLORER_BASE}/tx/${createTx}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm text-green-300 hover:text-green-200"
              >
                View tx {shortHash(createTx)} <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setPhase("commit")}
              className={`flex-1 py-3 rounded-xl border font-medium transition-all ${phase === "commit" ? "bg-white/10 border-white/20 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              Commit Phase
            </button>
            <button
              onClick={() => setPhase("settle")}
              className={`flex-1 py-3 rounded-xl border font-medium transition-all ${phase === "settle" ? "bg-white/10 border-white/20 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              Settlement Evidence
            </button>
          </div>
        </div>

        <div>
          {phase === "commit" ? <CommitBid activeAuctionId={activeAuctionId} /> : <SettleAuction />}
        </div>
      </div>
    </div>
  );
}
