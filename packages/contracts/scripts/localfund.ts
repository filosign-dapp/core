import hre from "hardhat";
import { getContracts } from "../exports";

async function main() {
    const chainId = hre.network.config.chainId;
    if (chainId !== 31337) {
        console.error("No ?");
        process.exit(1);
    }

    const [u1, u2] = await hre.viem.getWalletClients();

    for (const x of ["0xB8dd3786942057d4Bc78Fc894B80E8745151FE70"] as const) {
        u1.sendTransaction({
            to: x,
            value: 1_000_000_000_000_000n,
        });
    }

    const contracts1 = getContracts({
        chainId: 31337,
        client: u1
    })
    const contracts2 = getContracts({
        chainId: 31337,
        client: u2
    })

    await contracts1.FSManager.write.approveSender([u2.account.address])
    await contracts2.FSManager.write.approveSender([u1.account.address])
}


main()
    .then(() => console.log("Deployment script finished"))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
