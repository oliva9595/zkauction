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
AUCTION_ID="3"

cd "$ROOT"

echo "Reading contract-packed public inputs for auction $AUCTION_ID..."
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
num_inputs_hex="$(printf '%08x' 15)"
PROOF_HEX="$num_inputs_hex$PUB_HEX$(xxd -p "$PROOF_PATH" | tr -d '\n')"
echo "PROOF_HEX_LEN=${#PROOF_HEX}"

echo "Settling auction..."
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

echo "Contract token balance:"
"$STELLAR" contract invoke --id "$TOKEN_ID" --source "$SOURCE" --network "$NETWORK" -- balance --id "$AUCTION_CONTRACT_ID"
