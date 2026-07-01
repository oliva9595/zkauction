#!/bin/bash
set -e

cd /mnt/d/dorahack/stellar/zkauction/contracts

VERIFIER_WASM="verifier/target/wasm32v1-none/release/verifier.wasm"
AUCTION_WASM="auction/target/wasm32v1-none/release/auction.wasm"
SOURCE="deployer"
NETWORK="testnet"

echo "Installing Verifier..."
V_HASH=$(stellar contract install --wasm $VERIFIER_WASM --source $SOURCE --network $NETWORK)
echo "V_HASH=$V_HASH"
echo "Sleeping 10s..."
sleep 10
VERIFIER_ID=$(stellar contract deploy --wasm-hash $V_HASH --source $SOURCE --network $NETWORK)
echo "VERIFIER_ID=$VERIFIER_ID"

echo "Installing Auction..."
A_HASH=$(stellar contract install --wasm $AUCTION_WASM --source $SOURCE --network $NETWORK)
echo "A_HASH=$A_HASH"
echo "Sleeping 10s..."
sleep 10
AUCTION_ID=$(stellar contract deploy --wasm-hash $A_HASH --source $SOURCE --network $NETWORK)
echo "AUCTION_ID=$AUCTION_ID"
