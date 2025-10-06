import hre from "hardhat";
import { $ } from "bun";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  const blockHeight = await publicClient.getBlockNumber();

  console.log("Deploying contracts as ", deployer.account.address);

  const manager = await hre.viem.deployContract("FSManager");
  const fileRegistry = await hre.viem.getContractAt(
    "FSFileRegistry",
    await manager.read.fileRegistry(),
  );
  const keyRegistry = await hre.viem.getContractAt(
    "FSKeyRegistry",
    await manager.read.keyRegistry(),
  );

  console.log("Contracts deployed");

  const definitions = {
    FSManager: {
      address: manager.address,
      abi: manager.abi,
    },
    FSFileRegistry: {
      address: fileRegistry.address,
      abi: fileRegistry.abi,
    },
    FSKeyRegistry: {
      address: keyRegistry.address,
      abi: keyRegistry.abi,
    },
  } as const;

  Bun.file("definitions.ts").write(
    `export const definitions = ${JSON.stringify(
      definitions,
      null,
      2,
    )} as const;\nexport const contractsDeployedAtBlock = ${blockHeight.toString()}n;`,
  );

  console.log("Definitions written to definitions.ts");

  await $`bunx --bun hardhat verify --network filecoinCalibration ${manager.address} --force`;
  await $`bunx --bun hardhat verify --network filecoinCalibration ${fileRegistry.address} --force`;
  await $`bunx --bun hardhat verify --network filecoinCalibration ${keyRegistry.address} --force`;

  console.log("Contracts verified on block explorer");
}

main()
  .then(() => console.log("Deployment script finished"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
