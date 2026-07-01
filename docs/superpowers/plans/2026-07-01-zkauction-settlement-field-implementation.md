# zkAuction Settlement Field Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the zkAuction demo around the approved Settlement Field concept while preserving all verified Stellar testnet, Freighter, escrow, and proof behavior.

**Architecture:** Keep blockchain access in the existing client helpers, move verified-auction loading into a reusable hook, and compose the page from focused presentation components. The first viewport provides the jury narrative and live receipt; deeper sections expose the auction lifecycle, interactive demo workspace, and complete verification evidence.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, CSS keyframe motion, Lucide React, Stellar SDK, Freighter API, Browser/IAB verification.

---

## File Structure

**Create**

- `web/src/hooks/useVerifiedAuction.ts`: load and normalize the verified testnet auction.
- `web/src/lib/auctionDisplay.ts`: pure display formatting shared by receipt and evidence views.
- `web/src/components/SettlementField.tsx`: decorative motion background only.
- `web/src/components/SettlementReceipt.tsx`: compact first-viewport settlement summary.
- `web/src/components/HeroSettlement.tsx`: headline, actions, receipt, and proof dock.
- `web/src/components/AuctionLifecycle.tsx`: four-stage protocol explanation.
- `web/src/components/DemoWorkspace.tsx`: create/commit/settlement mode orchestration.
- `web/src/components/VerificationLab.tsx`: complete developer evidence view.

**Modify**

- `web/src/app/globals.css`: design tokens, animation, responsive layout, and reduced-motion rules.
- `web/src/app/layout.tsx`: full-width page shell and updated metadata.
- `web/src/app/page.tsx`: compose the approved page sections.
- `web/src/components/Header.tsx`: product mark, anchor navigation, network status, wallet action.
- `web/src/components/WalletConnect.tsx`: restyle states without changing Freighter behavior.
- `web/src/components/AuctionDashboard.tsx`: remove duplicated orchestration after migration.
- `web/src/components/CommitBid.tsx`: align form and success states with the new system.
- `web/src/components/SettleAuction.tsx`: become a compatibility wrapper around shared evidence UI.

No contract, circuit, generated binding, or transaction-helper files change.

### Task 1: Establish The Settlement Field Visual Foundation

**Files:**
- Modify: `web/src/app/globals.css`
- Modify: `web/src/app/layout.tsx`
- Modify: `web/src/components/Header.tsx`
- Modify: `web/src/components/WalletConnect.tsx`

- [ ] **Step 1: Record the current visual baseline**

Run the existing app and capture desktop and mobile screenshots before editing:

```powershell
npm run dev
```

Use Browser/IAB at `http://localhost:3000`, then capture `1440x900` and
`390x844`. Expected: the existing purple card-based interface renders and the
console has no framework error overlay.

- [ ] **Step 2: Add global design tokens and typography**

Replace the minimal root styles in `globals.css` with tokens that every new
component can consume:

```css
:root {
  --page: #070a09;
  --surface: #0d110f;
  --surface-raised: #121714;
  --ink: #f2f6f3;
  --muted: #97a19c;
  --faint: #626b67;
  --line: rgba(255, 255, 255, 0.1);
  --line-strong: rgba(255, 255, 255, 0.17);
  --verified: #70f0b2;
  --verified-ink: #07140e;
  --warm: #ff6b45;
  --danger: #ff8a7a;
  --radius-control: 6px;
  --radius-panel: 8px;
  --content: 1200px;
}

* {
  box-sizing: border-box;
  letter-spacing: 0;
}

html {
  scroll-behavior: smooth;
  background: var(--page);
}

body {
  margin: 0;
  background: var(--page);
  color: var(--ink);
  font-family: var(--font-inter), system-ui, sans-serif;
}

button,
input {
  font: inherit;
}

:focus-visible {
  outline: 2px solid var(--verified);
  outline-offset: 3px;
}
```

- [ ] **Step 3: Convert the root layout to a full-width product shell**

Use a full-width main element so the hero background can span the viewport:

```tsx
<html lang="en" className={`${inter.variable} h-full antialiased`}>
  <body className="min-h-full">
    <Header />
    <main>{children}</main>
  </body>
</html>
```

Update metadata description to:

```ts
description:
  "Private sealed-bid auctions with real Noir proofs and settlement on Stellar",
```

- [ ] **Step 4: Restyle the header without changing wallet behavior**

Build a 56px sticky header with:

```tsx
<a className="site-brand" href="#top" aria-label="zkAuction home">
  <span className="brand-mark" aria-hidden="true" />
  <span>zkAuction</span>
</a>
<nav aria-label="Primary navigation">
  <a href="#protocol">Protocol</a>
  <a href="#demo">Live demo</a>
  <a href="#evidence">Evidence</a>
</nav>
```

Keep `WalletConnect` dynamically imported with `ssr: false`. Replace rounded
pill styling with a compact 6px-radius control. Preserve `isConnected`,
`requestAccess`, address display, and inline error behavior exactly.

- [ ] **Step 5: Verify the foundation**

Run:

```powershell
npm run lint
npm run build
```

Expected: both commands exit `0`; navigation anchors and Connect Freighter are
keyboard focusable.

- [ ] **Step 6: Commit the foundation**

```powershell
git add web/src/app/globals.css web/src/app/layout.tsx web/src/components/Header.tsx web/src/components/WalletConnect.tsx
git commit -m "style: establish settlement field visual system"
```

### Task 2: Centralize Verified Auction Display Data

**Files:**
- Create: `web/src/lib/auctionDisplay.ts`
- Create: `web/src/hooks/useVerifiedAuction.ts`
- Modify: `web/src/components/SettleAuction.tsx`

- [ ] **Step 1: Extract display-safe formatting**

Create `auctionDisplay.ts` with the existing normalization behavior:

```ts
import type { AuctionData } from "./auctionClient";

export function formatAuctionValue(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "bigint") return value.toString();
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (typeof value === "object" && "tag" in value) {
    const tag = (value as { tag?: unknown }).tag;
    return typeof tag === "string" ? tag : JSON.stringify(value);
  }
  return String(value);
}

export function unwrapAuctionResult(value: unknown): AuctionData {
  if (
    value &&
    typeof value === "object" &&
    "unwrap" in value &&
    typeof (value as { unwrap?: unknown }).unwrap === "function"
  ) {
    return (value as { unwrap: () => AuctionData }).unwrap();
  }
  if (
    value &&
    typeof value === "object" &&
    "tag" in value &&
    (value as { tag?: unknown }).tag === "Ok" &&
    "values" in value
  ) {
    const values = (value as { values?: unknown }).values;
    if (Array.isArray(values) && values[0]) return values[0] as AuctionData;
  }
  return value as AuctionData;
}
```

- [ ] **Step 2: Add a reusable auction hook**

Create `useVerifiedAuction.ts`:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuctionData } from "../lib/auctionClient";
import { auctionClient, VERIFIED_AUCTION_ID } from "../lib/soroban";
import { unwrapAuctionResult } from "../lib/auctionDisplay";

export function useVerifiedAuction() {
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tx = await auctionClient.get_auction({
        auction_id: VERIFIED_AUCTION_ID,
      });
      setAuction(unwrapAuctionResult(tx.result));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { auction, error, loading, refresh };
}
```

- [ ] **Step 3: Make the current settlement view consume the hook**

Remove its local fetch effect and duplicated formatting functions:

```tsx
const { auction, error, loading, refresh } = useVerifiedAuction();
```

Add a retry button to the RPC-error state:

```tsx
<button type="button" onClick={() => void refresh()}>
  Retry testnet read
</button>
```

- [ ] **Step 4: Verify unchanged settlement behavior**

Run:

```powershell
npm run lint
npm run build
```

In Browser/IAB, open the settlement view. Expected values:

- Status: `Settled`
- Auction ID: `1`
- Bidder count: `3`
- Clearing price: `70`
- Settlement transaction starts with `48e7`

- [ ] **Step 5: Commit the data extraction**

```powershell
git add web/src/lib/auctionDisplay.ts web/src/hooks/useVerifiedAuction.ts web/src/components/SettleAuction.tsx
git commit -m "refactor: share verified auction state"
```

### Task 3: Build The Motion-First Hero And Receipt

**Files:**
- Create: `web/src/components/SettlementField.tsx`
- Create: `web/src/components/SettlementReceipt.tsx`
- Create: `web/src/components/HeroSettlement.tsx`
- Modify: `web/src/app/globals.css`

- [ ] **Step 1: Implement the decorative background**

`SettlementField` contains no text or business state:

```tsx
export default function SettlementField() {
  return (
    <div className="settlement-field" aria-hidden="true">
      <div className="settlement-field__mesh" />
      <div className="settlement-field__lines" />
      <div className="settlement-field__signal" />
    </div>
  );
}
```

Animate only `transform` and `opacity`:

```css
@keyframes field-drift {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-64px, 0, 0); }
}

@keyframes signal-breathe {
  50% { transform: scale(1.08); opacity: 0.72; }
}

@media (prefers-reduced-motion: reduce) {
  .settlement-field * {
    animation: none !important;
  }
}
```

- [ ] **Step 2: Build the receipt states**

Define explicit props:

```ts
type SettlementReceiptProps = {
  auction: AuctionData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};
```

Render stable-height states:

- Loading: “Reading Stellar testnet state”
- Error: “Settlement evidence temporarily unavailable” plus retry
- Success: clearing price, bidder count, escrow released, settled state

Use `formatAuctionValue`; never substitute fabricated auction values.

- [ ] **Step 3: Build the first viewport**

`HeroSettlement` calls `useVerifiedAuction` once and passes its result into the
receipt:

```tsx
<section id="top" className="hero-settlement">
  <SettlementField />
  <div className="hero-settlement__inner">
    <div className="hero-settlement__copy">
      <h1>Sealed by math.<br />Settled on Stellar.</h1>
      <p>
        A live end-to-end auction with private commitments, token escrow,
        a real Noir proof, and final settlement onchain.
      </p>
      <div className="hero-settlement__actions">
        <a className="button button--primary" href="#demo">Launch demo</a>
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
```

The proof dock uses real constants:

```ts
AUCTION_CONTRACT_ID
TESTNET_EVIDENCE.settleTx
TESTNET_EVIDENCE.proofSha256
```

- [ ] **Step 4: Verify first-viewport fit and motion**

At `1280x720`, expected:

- Headline, both CTAs, receipt, and proof dock are fully visible.
- The next section is slightly visible below the fold.
- Background motion does not shift layout.
- Receipt values resolve to the real testnet auction.
- Reduced-motion emulation stops ambient animation.

- [ ] **Step 5: Commit the hero**

```powershell
git add web/src/components/SettlementField.tsx web/src/components/SettlementReceipt.tsx web/src/components/HeroSettlement.tsx web/src/app/globals.css
git commit -m "feat: add motion-first settlement hero"
```

### Task 4: Recompose The Protocol And Live Demo Workspace

**Files:**
- Create: `web/src/components/AuctionLifecycle.tsx`
- Create: `web/src/components/DemoWorkspace.tsx`
- Modify: `web/src/components/CommitBid.tsx`
- Modify: `web/src/components/AuctionDashboard.tsx`

- [ ] **Step 1: Add the four-stage lifecycle**

Render a semantic ordered list:

```tsx
const stages = [
  ["Bid", "Create a private commitment in the browser."],
  ["Lock", "Escrow the bid asset on Stellar."],
  ["Prove", "Verify the Noir UltraHonk settlement proof."],
  ["Pay", "Finalize the winner, refunds, and clearing price."],
] as const;

export default function AuctionLifecycle() {
  return (
    <section id="protocol" className="protocol-section">
      <div className="section-heading">
        <span>Protocol lifecycle</span>
        <h2>Privacy where it matters. Proof where it counts.</h2>
      </div>
      <ol className="lifecycle">
        {stages.map(([title, body], index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 2: Move create-auction state into `DemoWorkspace`**

Move the existing `createAuction` function and its state from
`AuctionDashboard` without changing:

- seller
- native token contract
- reserve price
- second-price setting
- one-hour deadline
- `signAndSend` flow

Use an accessible three-mode segmented control:

```tsx
type WorkspaceMode = "create" | "commit" | "settlement";

<div role="tablist" aria-label="Auction demo steps">
  {(["create", "commit", "settlement"] as const).map((mode) => (
    <button
      key={mode}
      role="tab"
      aria-selected={activeMode === mode}
      onClick={() => setActiveMode(mode)}
    >
      {labels[mode]}
    </button>
  ))}
</div>
```

- [ ] **Step 3: Restyle the commit form**

Preserve commitment hashing and transaction submission. Change only structure
and classes:

- 6px control radius
- explicit field hint for stroops
- inline signing/submission state
- stable success receipt
- visible transaction link
- no purple gradients

Keep the warning that the browser hash is a commitment demo while the displayed
settlement uses the real Noir proof pipeline.

- [ ] **Step 4: Reduce `AuctionDashboard` to a compatibility wrapper**

Replace duplicated layout with:

```tsx
import DemoWorkspace from "./DemoWorkspace";

export default function AuctionDashboard() {
  return <DemoWorkspace />;
}
```

- [ ] **Step 5: Verify the interaction loop**

Browser flow:

1. Open `#demo`.
2. Switch Create → Commit → Settlement.
3. Verify `aria-selected` moves with the visible panel.
4. Verify Commit disables submission until an auction exists and a hash is made.
5. Trigger Connect Freighter and confirm the inline missing/locked-extension
   state remains visible when no wallet is available.

Run:

```powershell
npm run lint
npm run build
```

- [ ] **Step 6: Commit the workspace**

```powershell
git add web/src/components/AuctionLifecycle.tsx web/src/components/DemoWorkspace.tsx web/src/components/CommitBid.tsx web/src/components/AuctionDashboard.tsx
git commit -m "feat: organize the live auction workspace"
```

### Task 5: Add The Developer Verification Lab

**Files:**
- Create: `web/src/components/VerificationLab.tsx`
- Modify: `web/src/components/SettleAuction.tsx`
- Modify: `web/src/app/page.tsx`

- [ ] **Step 1: Build evidence groups from real data**

`VerificationLab` uses `useVerifiedAuction` and groups evidence into:

```ts
const transactionRows = [
  ["Create auction", TESTNET_EVIDENCE.createAuctionTx],
  ["Commit bidder 1", TESTNET_EVIDENCE.bidder1CommitTx],
  ["Commit bidder 2", TESTNET_EVIDENCE.bidder2CommitTx],
  ["Commit bidder 3", TESTNET_EVIDENCE.bidder3CommitTx],
  ["Close phase", TESTNET_EVIDENCE.closeTx],
  ["Settle proof", TESTNET_EVIDENCE.settleTx],
] as const;
```

The summary must include auction ID, status, bidder count, winner, clearing
price, token escrow balance after settlement, contract ID, proof SHA-256, and VK
SHA-256.

- [ ] **Step 2: Use semantic disclosure for deep details**

Use native disclosure elements so details work without extra state:

```tsx
<details>
  <summary>Proof artifacts</summary>
  <EvidenceValue label="Proof SHA-256" value={TESTNET_EVIDENCE.proofSha256} />
  <EvidenceValue label="VK SHA-256" value={TESTNET_EVIDENCE.vkSha256} />
</details>
```

Every transaction and contract link opens the Stellar testnet explorer in a new
tab with `rel="noreferrer"`.

- [ ] **Step 3: Compose the complete page**

Replace the current hero plus dashboard composition:

```tsx
export default function Home() {
  return (
    <>
      <HeroSettlement />
      <div className="page-sections">
        <AuctionLifecycle />
        <section id="demo"><DemoWorkspace /></section>
        <section id="evidence"><VerificationLab /></section>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Keep the old settlement import surface valid**

Make `SettleAuction` render the evidence component or a focused settlement
variant so existing imports do not break:

```tsx
export default function SettleAuction() {
  return <VerificationLab compact />;
}
```

Add `compact?: boolean` to `VerificationLabProps`; compact mode omits the outer
section heading but retains all evidence and RPC states.

- [ ] **Step 5: Verify real evidence and links**

Browser assertions:

- “Settled” is visible.
- Auction `1`, bidder count `3`, and clearing price `70` are visible.
- Winner starts with `GB3G`.
- Contract link includes `CAKDGU5B`.
- Settlement link includes `48e7da69`.
- Proof and VK hashes render in full when their disclosures are open.
- No horizontal overflow occurs at `390x844`.

- [ ] **Step 6: Commit the evidence surface**

```powershell
git add web/src/components/VerificationLab.tsx web/src/components/SettleAuction.tsx web/src/app/page.tsx
git commit -m "feat: add developer verification lab"
```

### Task 6: Complete Visual Fidelity And Browser Verification

**Files:**
- Modify: `web/src/app/globals.css`
- Modify: any component from Tasks 1-5 only when a verified mismatch requires it

- [ ] **Step 1: Run static verification**

```powershell
npm run lint
npm run build
```

Expected: both exit `0` with no TypeScript or ESLint errors.

- [ ] **Step 2: Verify desktop and laptop**

Use Browser/IAB:

- `1440x900`: full composition, balanced hero, evidence workspace readable.
- `1280x720`: headline, actions, receipt, and proof dock fit; lifecycle preview
  remains visible.

Check page identity, nonblank content, framework overlay, console warnings and
errors, screenshot evidence, and CTA anchor navigation.

- [ ] **Step 3: Verify mobile**

At `390x844`, confirm:

- Single-column order matches the spec.
- Header does not collide with wallet controls.
- Technical strings wrap inside their containers.
- No page-level horizontal scrollbar.
- Buttons and tabs remain at least 40px high.
- Background layers do not reduce text contrast.

- [ ] **Step 4: Verify motion and accessibility**

Confirm:

- Ambient field visibly moves in normal mode.
- Reduced-motion disables non-essential animations.
- Keyboard focus is visible on nav, CTA, tabs, inputs, buttons, disclosures, and
  explorer links.
- Status text does not rely on green alone.

- [ ] **Step 5: Run the core interaction smoke**

The flow under test is:

```text
app loads
→ real settlement receipt resolves
→ View real evidence scrolls to Verification Lab
→ proof details open
→ Live demo modes switch
→ Connect Freighter produces access request or an actionable inline error
```

Expected: each transition produces a visible state change and no relevant
console error.

- [ ] **Step 6: Compare against the approved concept**

Capture final desktop and mobile screenshots outside the repository. Inspect
the approved Settlement Field concept and latest render with `view_image`.
Record a fidelity ledger covering:

1. Headline and first-viewport hierarchy
2. Background motion and focal lighting
3. Settlement receipt anatomy
4. Proof dock density
5. Dark neutral palette and status colors
6. Responsive collapse
7. Interaction states

Fix every material mismatch before completion.

- [ ] **Step 7: Commit QA corrections**

```powershell
git add web/src
git commit -m "fix: complete settlement field visual QA"
```

- [ ] **Step 8: Stop before public deployment**

Report the local verification evidence and ask for explicit confirmation before
running a new Vercel production deployment. Do not push Git.

