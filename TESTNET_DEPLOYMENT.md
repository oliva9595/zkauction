# zkAuction Testnet Deployment

Deployed: 2026-07-01

## Network

- Network: Stellar Testnet
- RPC: `https://soroban-testnet.stellar.org/`
- Source identity: `deployer`
- Source address: `GB4W3UIOBSERQ45D5KU2L56WN4CZJBOKR7KXUH4QFCW2TACCZJOOBH43`

## Current Contract

- Auction contract ID: `CAKDGU5BFBHR675MJEEA6UQOJ2RL342D5LGU4FYTDGLI4LL4I7UFLSV6`
- Explorer:
  `https://stellar.expert/explorer/testnet/contract/CAKDGU5BFBHR675MJEEA6UQOJ2RL342D5LGU4FYTDGLI4LL4I7UFLSV6`
- Uploaded wasm hash: `c1dc4978aa9e48e0573132d67d4d851a1ac77c6f39ac3480415b5f07f167e5cc`
- Deploy transaction:
  `be172f8cd502429c0c747fc8844c556b21e6c30ca7bbea8d921a0bf7f9dc042a`

Constructor args:

- `admin`: `GB4W3UIOBSERQ45D5KU2L56WN4CZJBOKR7KXUH4QFCW2TACCZJOOBH43`
- `vk_bytes`: raw bytes from `circuits/auction_settle/target/vk`

Artifact hashes:

```text
e42da8f83e29e7ff858d2556c90ea8e400bf345c59c8d4eafc75470b77610b69  circuits/auction_settle/target/vk
7ae60f32d9df8a596db541c731f92690823e23ab0b2bff5485b45098296d500d  circuits/auction_settle/target/proof_e2e/proof
ba6f1dce5f5c458d1b8cfb0571eac14ac48c0c783afa07208e911b6b82210cd7  circuits/auction_settle/target/proof_e2e/public_inputs
```

## Full E2E Settlement

Auction `1` on the current contract completed the full testnet flow:

1. Created second-price auction.
2. Created and funded three bidder identities.
3. Committed three sealed bids with native-asset escrow of `100` each.
4. Closed commit phase after deadline.
5. Generated a real Noir witness and UltraHonk proof with Barretenberg using
   `--scheme ultra_honk --oracle_hash keccak`.
6. Settled on-chain with the raw proof file.
7. Verified final on-chain state and zero residual contract token balance.

Transactions:

| Step | Transaction |
| --- | --- |
| create auction | `336eaa1995148ab931a442d833c443edf2ce40002279c3796c696358a28089e5` |
| bidder 1 commit escrow | `c3ed14555da0195c674f51ca50c72486245d02dc69cc5dbb70a2956935d9e634` |
| bidder 2 commit escrow | `79fa69c042136ad6ed2ae8d3bfafddd46d3bf4419aaeee0c452d809d9a7fc031` |
| bidder 3 commit escrow | `74267b1ce16100a0b694ab646291da87646a3272837427354a4ee0797f346388` |
| close commit phase | `ce0cb4641efadd8e0bb744b1733727b10f99ee19c4c6dfbb023654839ef61d57` |
| settle with real proof | `48e7da6972244096ce0193007d1dbaaf97c80f985314f1cb762365460792865d` |

Settlement transfer evidence from the settle transaction:

- Loser bidder 1 refund: `100`
- Seller payment: `70`
- Winner bidder 2 refund/change: `30`
- Loser bidder 3 refund: `100`

Final `get_auction(1)`:

```json
{
  "bidder_count": 3,
  "clearing_price": 70,
  "id": 1,
  "params": {
    "deadline": 1782898227,
    "reserve_price": 10,
    "second_price": true,
    "seller": "GB4W3UIOBSERQ45D5KU2L56WN4CZJBOKR7KXUH4QFCW2TACCZJOOBH43",
    "token": "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"
  },
  "status": "Settled",
  "winner": "GB3GWNT5ILVYVA5TNSALZY774TFVDQBQG2JTTPGQV6UBMYXGGVDHHN2W"
}
```

Final native-asset contract balance for the auction contract:

```text
"0"
```

Native proof verification:

```text
bb verify --scheme ultra_honk --oracle_hash keccak ... -> Proof verified successfully
```

## Commands

Deploy:

```powershell
wsl bash /mnt/d/dorahack/stellar/zkauction/scripts/deploy_testnet_real.sh
```

Full E2E:

```powershell
wsl bash /mnt/d/dorahack/stellar/zkauction/scripts/e2e_testnet_settle.sh
```

If E2E reaches settlement proof generation but needs a manual retry, use raw
proof bytes:

```powershell
wsl /home/enzo95/.local/bin/stellar contract invoke --id CAKDGU5BFBHR675MJEEA6UQOJ2RL342D5LGU4FYTDGLI4LL4I7UFLSV6 --source deployer --network testnet --instruction-leeway 100000000 -- settle --auction_id 1 --proof-file-path /mnt/d/dorahack/stellar/zkauction/circuits/auction_settle/target/proof_e2e/proof --winner_index 1 --clearing_price 70
```

## Superseded Deployment

The earlier contract
`CAULWL75SWD4C7BIZINA5KQKKIDWHFYZNRLCILYQMXDMSTY4H2WJ2FKN` was a deploy smoke
that stored VK bytes incorrectly as a hex string and was superseded by the
current contract above.

## Notes

- No public web deployment was performed.
- No Git push was performed.
