#!/bin/bash
set -e

# Setup paths
AUCTION_WASM="../contracts/auction/target/wasm32v1-none/release/auction.wasm"
CIRCUIT_DIR="../circuits/auction_settle"
SOURCE="deployer"

echo "======================================"
echo "    zkAuction Mock CLI Flow (Dry Run) "
echo "======================================"

AUCTION_ID="CBLIX3VYZTOF6YMEQBMI2ERCZVOJY6AE374UDEWRXELGDXKOZE5EA3GV"

echo "=> Using Mock Auction Contract ID: $AUCTION_ID"

echo "[3/7] Creating Auction..."
SELLER="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
TOKEN="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
DEADLINE=$(($(date +%s) + 3600))
PARAMS="{\"seller\": \"$SELLER\", \"token\": \"$TOKEN\", \"reserve_price\": 10, \"deadline\": $DEADLINE, \"second_price\": false}"

echo "stellar contract invoke --id $AUCTION_ID --source $SOURCE -- create_auction --p '$PARAMS'"
AUCTION_NUM=1024
echo "=> Simulated Auction Creation #$AUCTION_NUM"

echo "[4/7] Bidders Committing Bids..."
echo "stellar contract invoke --id $AUCTION_ID --source $SOURCE -- commit_bid --auction_id $AUCTION_NUM --bidder $SELLER --commitment \"0000000000000000000000000000000000000000000000000000000000000000\" --escrow_amount 100"

echo "[5/7] Closing Commit Phase..."
echo "stellar contract invoke --id $AUCTION_ID --source $SOURCE -- close_commit_phase --auction_id $AUCTION_NUM"

echo "[6/7] Generating Proof (Mock/CLI)..."
echo "WARNING (Limitation): A valid Noir proof generation script via bb is not yet integrated for the E2E flow."
echo "Using a dummy 400-byte proof instead. The on-chain verification will FAIL as expected."
MOCK_PROOF=$(printf "%0800d" 0)

echo "[7/7] Settling Auction..."
# settle(auction_id, proof, winner_index, clearing_price)
echo "stellar contract invoke --id $AUCTION_ID --source $SOURCE -- settle --auction_id $AUCTION_NUM --proof $MOCK_PROOF --winner_index 1 --clearing_price 90"

echo "=> Note: Settlement intentionally failed as expected (Mock Verifier not set up with real proofs)."
echo "Mock CLI Flow Completed! (Real E2E is BLOCKED missing proof)"
