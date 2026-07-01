#!/usr/bin/env bash
set -euo pipefail

ROOT="/mnt/d/dorahack/stellar/zkauction"
STELLAR="/home/enzo95/.local/bin/stellar"
NARGO="/home/enzo95/.nargo/bin/nargo"
BB="/home/enzo95/.bb/bb"
NETWORK="testnet"
SOURCE="deployer"
AUCTION_CONTRACT_ID="CAKDGU5BFBHR675MJEEA6UQOJ2RL342D5LGU4FYTDGLI4LL4I7UFLSV6"
TOKEN_ID="CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"

C0="2aa1398e6507e38c35deddfc3d2862ca905aa56147b8d36074391a18e6c34c2b"
C1="029bb2789d5f71d5fc7fed88cb43563bd14feca725c6421c276a87c07d8f27a3"
C2="28bba84e5fb3daea33a040cf6f46cd98f6a34a57d9d2ba57dba7703887b5e835"

cd "$ROOT"

ts="$(date +%s)"
BIDDER1="zkauction-bidder1-$ts"
BIDDER2="zkauction-bidder2-$ts"
BIDDER3="zkauction-bidder3-$ts"

echo "Generating/funding bidder identities..."
"$STELLAR" keys generate "$BIDDER1" --fund --network "$NETWORK" >/dev/null
"$STELLAR" keys generate "$BIDDER2" --fund --network "$NETWORK" >/dev/null
"$STELLAR" keys generate "$BIDDER3" --fund --network "$NETWORK" >/dev/null

SELLER="$("$STELLAR" keys address "$SOURCE")"
B1="$("$STELLAR" keys address "$BIDDER1")"
B2="$("$STELLAR" keys address "$BIDDER2")"
B3="$("$STELLAR" keys address "$BIDDER3")"

echo "SELLER=$SELLER"
echo "BIDDER1=$B1"
echo "BIDDER2=$B2"
echo "BIDDER3=$B3"
echo "TOKEN_ID=$TOKEN_ID"

DEADLINE="$(($(date +%s) + 180))"
PARAMS="{\"seller\":\"$SELLER\",\"token\":\"$TOKEN_ID\",\"reserve_price\":10,\"deadline\":$DEADLINE,\"second_price\":true}"

echo "Creating auction..."
CREATE_OUT="$("$STELLAR" contract invoke \
  --id "$AUCTION_CONTRACT_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- \
  create_auction \
  --params "$PARAMS")"
echo "$CREATE_OUT"
AUCTION_ID="$(echo "$CREATE_OUT" | tail -n 1 | tr -d '\r')"
echo "AUCTION_ID=$AUCTION_ID"

echo "Committing bids with native-asset escrow..."
"$STELLAR" contract invoke --id "$AUCTION_CONTRACT_ID" --source "$BIDDER1" --network "$NETWORK" -- commit_bid --auction_id "$AUCTION_ID" --bidder "$B1" --commitment "$C0" --escrow_amount 100
"$STELLAR" contract invoke --id "$AUCTION_CONTRACT_ID" --source "$BIDDER2" --network "$NETWORK" -- commit_bid --auction_id "$AUCTION_ID" --bidder "$B2" --commitment "$C1" --escrow_amount 100
"$STELLAR" contract invoke --id "$AUCTION_CONTRACT_ID" --source "$BIDDER3" --network "$NETWORK" -- commit_bid --auction_id "$AUCTION_ID" --bidder "$B3" --commitment "$C2" --escrow_amount 100

echo "Waiting for close deadline..."
now="$(date +%s)"
if [ "$now" -le "$DEADLINE" ]; then
  sleep "$((DEADLINE - now + 8))"
fi

echo "Closing commit phase..."
"$STELLAR" contract invoke --id "$AUCTION_CONTRACT_ID" --source "$SOURCE" --network "$NETWORK" -- close_commit_phase --auction_id "$AUCTION_ID"

echo "Reading contract-packed public inputs..."
PUB_HEX="$("$STELLAR" contract invoke \
  --id "$AUCTION_CONTRACT_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- \
  pack_public_inputs_view \
  --auction_id "$AUCTION_ID" \
  --winner_index 1 \
  --clearing_price 70 | tail -n 1 | tr -d '\"\r')"
echo "PUB_HEX_LEN=${#PUB_HEX}"

if [ "${#PUB_HEX}" -ne 960 ]; then
  echo "Unexpected public input hex length: ${#PUB_HEX}" >&2
  exit 1
fi

fields=()
for i in $(seq 0 14); do
  start=$((i * 64))
  fields+=("0x${PUB_HEX:$start:64}")
done

cat > circuits/auction_settle/Prover.toml <<EOF
bids = ["50", "90", "70", "0", "0", "0", "0", "0"]
blindings = ["1", "2", "3", "0", "0", "0", "0", "0"]
active = [true, true, true, false, false, false, false, false]
auction_id = "${fields[0]}"
seller = "${fields[1]}"
token_id = "${fields[2]}"
commitments = ["${fields[3]}", "${fields[4]}", "${fields[5]}", "${fields[6]}", "${fields[7]}", "${fields[8]}", "${fields[9]}", "${fields[10]}"]
reserve_price = "${fields[11]}"
second_price = true
winner_index = "1"
clearing_price = "70"
EOF

echo "Generating Noir witness..."
"$NARGO" execute --program-dir circuits/auction_settle

echo "Generating UltraHonk proof..."
"$BB" prove --scheme ultra_honk --oracle_hash keccak -b circuits/auction_settle/target/auction_settle.json -w circuits/auction_settle/target/auction_settle.gz -o circuits/auction_settle/target/proof_e2e

PROOF_PATH="circuits/auction_settle/target/proof_e2e/proof"
if [ ! -f "$PROOF_PATH" ]; then
  echo "Proof not found at $PROOF_PATH" >&2
  exit 1
fi

num_inputs_hex="$(printf '%08x' 15)"
PROOF_HEX="$num_inputs_hex$PUB_HEX$(xxd -p "$PROOF_PATH" | tr -d '\n')"
echo "PROOF_HEX_LEN=${#PROOF_HEX}"

echo "Settling auction with real proof..."
"$STELLAR" contract invoke \
  --id "$AUCTION_CONTRACT_ID" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- \
  settle \
  --auction_id "$AUCTION_ID" \
  --proof "$PROOF_HEX" \
  --winner_index 1 \
  --clearing_price 70

echo "Final auction state:"
"$STELLAR" contract invoke --id "$AUCTION_CONTRACT_ID" --source "$SOURCE" --network "$NETWORK" -- get_auction --auction_id "$AUCTION_ID"

echo "Balances:"
echo -n "seller="
"$STELLAR" contract invoke --id "$TOKEN_ID" --source "$SOURCE" --network "$NETWORK" -- balance --id "$SELLER"
echo -n "bidder1="
"$STELLAR" contract invoke --id "$TOKEN_ID" --source "$SOURCE" --network "$NETWORK" -- balance --id "$B1"
echo -n "bidder2="
"$STELLAR" contract invoke --id "$TOKEN_ID" --source "$SOURCE" --network "$NETWORK" -- balance --id "$B2"
echo -n "bidder3="
"$STELLAR" contract invoke --id "$TOKEN_ID" --source "$SOURCE" --network "$NETWORK" -- balance --id "$B3"
echo -n "contract="
"$STELLAR" contract invoke --id "$TOKEN_ID" --source "$SOURCE" --network "$NETWORK" -- balance --id "$AUCTION_CONTRACT_ID"
