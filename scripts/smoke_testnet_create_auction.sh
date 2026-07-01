#!/usr/bin/env bash
set -euo pipefail

ROOT="/mnt/d/dorahack/stellar/zkauction"
STELLAR="/home/enzo95/.local/bin/stellar"
SOURCE="deployer"
NETWORK="testnet"
AUCTION_ID="CAKDGU5BFBHR675MJEEA6UQOJ2RL342D5LGU4FYTDGLI4LL4I7UFLSV6"
TOKEN_ID="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

cd "$ROOT"

SELLER="$("$STELLAR" keys address "$SOURCE")"
DEADLINE="$(($(date +%s) + 3600))"
PARAMS="{\"seller\":\"$SELLER\",\"token\":\"$TOKEN_ID\",\"reserve_price\":10,\"deadline\":$DEADLINE,\"second_price\":true}"

echo "AUCTION_CONTRACT_ID=$AUCTION_ID"
echo "SELLER=$SELLER"
echo "TOKEN_ID=$TOKEN_ID"
echo "DEADLINE=$DEADLINE"
echo "PARAMS=$PARAMS"

"$STELLAR" contract invoke \
  --id "$AUCTION_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- \
  create_auction \
  --params "$PARAMS"
