#!/usr/bin/env bash
set -euo pipefail

ROOT="/mnt/d/dorahack/stellar/zkauction"
STELLAR="/home/enzo95/.local/bin/stellar"
SOURCE="deployer"
NETWORK="testnet"
WASM_HASH="c1dc4978aa9e48e0573132d67d4d851a1ac77c6f39ac3480415b5f07f167e5cc"

cd "$ROOT"

ADMIN="$("$STELLAR" keys address "$SOURCE")"
VK_PATH="circuits/auction_settle/target/vk"

echo "ADMIN=$ADMIN"
echo "VK_PATH=$VK_PATH"
echo "VK_BYTES=$(wc -c < "$VK_PATH")"
echo "WASM_HASH=$WASM_HASH"

"$STELLAR" contract deploy \
  --wasm-hash "$WASM_HASH" \
  --source "$SOURCE" \
  --network "$NETWORK" \
  -- \
  --admin "$ADMIN" \
  --vk_bytes-file-path "$VK_PATH"
