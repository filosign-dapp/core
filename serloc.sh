cd packages/contracts
FC_PVT_KEY="0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e" bunx --bun hardhat run --network localhost scripts/deploy.ts
FC_PVT_KEY="0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e" bunx --bun hardhat run --network localhost scripts/localfund.ts
cd ../server
DB_NAME="test" bun run droptest.ts
DB_NAME="test" bun db:migrate
RUNTIME_CHAIN_ID="31337" DB_NAME="test" bun run index.ts
