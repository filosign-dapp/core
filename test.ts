import { createPublicClient, http } from "viem";
import { filecoinCalibration } from "viem/chains";

const view = createPublicClient({
  transport: http("https://api.calibration.node.glif.io/rpc/v1"),
  chain: filecoinCalibration,
});

console.log(await view.getBlockNumber());
