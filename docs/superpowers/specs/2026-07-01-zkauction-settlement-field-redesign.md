# zkAuction Settlement Field Redesign

## Objective

Redesign the zkAuction web demo so it succeeds with two audiences:

1. Convince hackathon judges within the first few seconds.
2. Let developers inspect the real ZK and on-chain evidence in depth.

The redesign must preserve the existing Stellar testnet functionality, Freighter
flows, real settlement evidence, contract integration, and transaction links.

## Approved Direction

The approved visual direction is **Settlement Field**.

The interface opens with the statement:

> Sealed by math. Settled on Stellar.

The first viewport combines a concise product claim, primary demo actions, a
real settlement receipt, and a restrained animated data field. The receipt is
the visual anchor. Background motion directs attention toward it without
reducing text contrast or competing with controls.

## Information Architecture

### First Viewport

- Compact product navigation and Stellar Testnet status.
- Headline and one-sentence explanation.
- Primary action: launch the live auction workflow.
- Secondary action: inspect real settlement evidence.
- Settlement receipt populated from the verified testnet auction.
- Compact proof dock containing contract, proof system, settlement transaction,
  and escrow state.

### Auction Lifecycle

A clear sequence explains the complete protocol:

1. Bid: create a private commitment.
2. Lock: escrow the bid asset on Stellar.
3. Prove: produce and verify the Noir UltraHonk settlement proof.
4. Pay: finalize winner, clearing price, refunds, and escrow release.

The lifecycle must distinguish private data, public inputs, proof verification,
and final on-chain state.

### Demo Workspace

The existing actions are reorganized into a focused workspace:

- Create Auction
- Commit Bid
- Settlement

The selected mode must be obvious, keyboard accessible, and stable across
responsive layouts. Existing blockchain behavior remains unchanged.

### Verification Lab

The evidence surface provides developer-level inspection without crowding the
hero:

- Auction ID and state
- Winner and clearing price
- Bidder count
- Contract ID
- Proof system
- Proof hash
- Verification key hash
- Public inputs
- Settlement transaction
- Explorer links

Technical values use a monospace treatment, support copy actions where useful,
and remain readable without horizontal page overflow.

## Component Architecture

### `HeroSettlement`

Owns the first-view narrative, calls to action, animated background, and real
settlement receipt. It receives settlement data rather than fetching blockchain
state directly.

### `SettlementField`

Renders the decorative background using CSS transforms and opacity. It has no
business logic, accepts reduced-motion preferences, and degrades to a static
background on constrained devices.

### `SettlementReceipt`

Displays verified auction output and settlement state. It supports loading,
verified, unavailable, and RPC-error states without replacing real data with
fabricated values.

### `AuctionLifecycle`

Explains the four protocol stages and highlights the stage associated with the
currently selected workspace mode.

### `DemoWorkspace`

Coordinates the existing create, commit, and settlement components. It owns
only presentation-level mode selection and passes blockchain results upward
when the summary must refresh.

### `VerificationLab`

Presents evidence in grouped rows and expandable detail sections. Explorer
links must point to the configured testnet contract and transactions.

### `NetworkStatus`

Reports Stellar Testnet, RPC availability, deployed contract identity, and
Freighter connection state. Wallet connection remains an explicit user action.

## Data Flow

1. The page loads the verified auction summary from the existing auction client.
2. Loading state renders the structure immediately without fake evidence.
3. Successful data is passed into the receipt and verification lab.
4. Wallet-driven actions continue through the existing Freighter transaction
   helpers.
5. Create and commit results update the workspace with transaction feedback.
6. Settlement evidence can be refreshed without reloading the whole page.

No contract interface, proof generation logic, escrow logic, or transaction
semantics are changed by this redesign.

## Visual System

- Native dark canvas based on near-black neutral surfaces.
- Near-white primary text and restrained cool-gray secondary text.
- Green is reserved for verified, live, and successful states.
- A small warm accent may identify the product mark or primary narrative focus.
- Borders are subtle and functional.
- Cards use a maximum radius of 8px.
- UI spacing follows an 8px base rhythm.
- Display and UI text use zero letter spacing.
- Technical values use a monospace family.
- The design avoids purple gradients, decorative blobs, nested cards, oversized
  marketing sections, and non-functional status decoration.

## Motion

- The background uses transform and opacity animation only.
- Ambient motion remains slow and low contrast.
- Settlement progression may reveal commitment, proof acceptance, and final
  state in sequence.
- Hover and focus motion clarifies interaction but never hides information.
- `prefers-reduced-motion: reduce` disables non-essential animation.
- Mobile uses fewer layers and lower animation complexity.
- Motion must not shift layout or resize controls.

## Responsive Behavior

### Desktop

The hero uses a two-zone composition: narrative on the left and settlement
receipt on the right. The evidence dock remains visible in the first viewport.

### Laptop

The first viewport must fit at `1280x720` without clipping the primary actions
or settlement receipt. A hint of the lifecycle section remains visible.

### Mobile

At `390x844`, content becomes a single column in this order:

1. Headline and actions
2. Settlement receipt
3. Proof dock
4. Lifecycle
5. Demo workspace
6. Verification lab

Technical strings wrap or truncate with explicit copy/open actions. No
horizontal page overflow is allowed.

## Error And Loading States

- Wallet missing: explain that Freighter is required and keep read-only evidence
  available.
- Wallet rejected: show a concise inline message beside the initiating action.
- Signing: identify the transaction awaiting approval.
- Submitting: indicate submission to Stellar Testnet.
- Confirming: indicate on-chain confirmation.
- RPC unavailable: preserve the page and show evidence as temporarily
  unavailable.
- Transaction failure: retain user input and expose a retry action.

Errors must not appear only in the browser console.

## Accessibility

- All actions are keyboard reachable.
- Focus indicators remain visible against animated backgrounds.
- Status is communicated with text, not color alone.
- Motion respects reduced-motion preferences.
- Contrast meets WCAG AA for normal text.
- Icon-only actions have accessible labels and tooltips.

## Verification

Run:

- ESLint
- Next.js production build
- Browser smoke with console inspection

Browser verification covers:

- `1440x900` desktop
- `1280x720` laptop
- `390x844` mobile
- Initial settlement evidence load
- Demo workspace mode switching
- Real testnet values in the receipt and verification lab
- Explorer links
- Freighter connection trigger
- Reduced-motion behavior
- No clipping, overlap, horizontal overflow, or framework overlay

The latest implementation screenshots must be compared directly against the
approved Settlement Field concept. Deployment to Vercel happens only after the
local implementation passes this verification and the user requests or confirms
the production update.

## Out Of Scope

- Smart contract changes
- Circuit or proof-system changes
- New auction mechanics
- Mainnet deployment
- New backend services
- Replacing Freighter
- Changing existing verified testnet evidence

