import { synapse } from "./lib/synapse";

const file = await synapse.storage.download("bafybeidwjz75yp3a3zegdj7bqj6ozl6s3d4r54yq3vxyw46ldztxdyu35e", {
    withCDN: true,
    providerAddress: "0xAfdd652756bAe790559cD07a96Caee310D3C6381",
});

console.log(file);