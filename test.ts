import { synapse } from "./packages/server/lib/synapse";
import { jsonStringify } from "./packages/server/lib/utils/json";
import { calculate } from "@filoz/synapse-sdk/piece";

const bytes = crypto.getRandomValues(new Uint8Array(360));

const expect = calculate(bytes);

console.log(jsonStringify(expect.toString()));

console.log("=======");

const piece = await synapse.storage.upload(bytes);

console.log(jsonStringify(piece));
