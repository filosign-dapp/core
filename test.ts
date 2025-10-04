import {
  ripemd160,
  keccak256,
  encodePacked,
  createWalletClient,
  http,
  sliceHex,
  concatHex,
} from "viem";
import {
  toB64,
  ensureWasmInitialized,
  generateSalts,
  generateNonce,
  generateRegisterChallenge,
  getPublicKeyFromRegenerated,
  deriveEncryptionMaterial,
  toHex,
  regenerateEncryptionKey,
} from "filosign-crypto-utils";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { filecoinCalibration } from "viem/chains";
await ensureWasmInitialized();
const saltPin =
  "0x274f4f0f935a73153212b89818d63657b5befc2e9f36d0c24b69b47165ffd604";

const pin = "2222";
const info = "stupid";

const wallet = createWalletClient({
  chain: filecoinCalibration,
  transport: http(),
  account: privateKeyToAccount(generatePrivateKey()),
});

const salts = generateSalts();
const nonce = generateNonce();
const { challenge } = generateRegisterChallenge(
  wallet.account.address,
  "1",
  nonce,
);

const signature = await wallet.signMessage({ message: challenge });

const { encSeed } = deriveEncryptionMaterial(
  signature,
  pin,
  salts.pinSalt,
  salts.authSalt,
  salts.wrapperSalt,
  info,
);

const pinCommitment1 = ripemd160(
  keccak256(encodePacked(["string", "string"], [salts.pinSalt, pin])),
);

console.log("register:", {
  pinSalt: salts.pinSalt,
  pin,
  pinCommitment: pinCommitment1,
});

const { publicKey } = getPublicKeyFromRegenerated(
  signature,
  pin,
  salts.pinSalt,
  salts.authSalt,
  salts.wrapperSalt,
  encSeed,
  info,
);

const encSeedHex = `0x${toHex(encSeed)}` as const;

const onchain = [
  {
    nonce: `0x${toHex(nonce)}`,
    salt_pin: `0x${toHex(salts.pinSalt)}`,
    salt_auth: `0x${toHex(salts.authSalt)}`,
    salt_wrap: `0x${toHex(salts.wrapperSalt)}`,
    seed_head: sliceHex(encSeedHex, 0, 20),
    seed_word: sliceHex(encSeedHex, 20, 52),
    seed_tail: sliceHex(encSeedHex, 52, 72),
    commitment_pin: pinCommitment1,
  },
  `0x${toHex(publicKey)}`,
] as const;

const { encryptionKey } = regenerateEncryptionKey(
  signature,
  pin,
  salts.pinSalt,
  salts.authSalt,
  salts.wrapperSalt,
  encSeed,
  info,
);

console.log(encryptionKey);

const onchainInfo = onchain[0];

const pinCommitment2 = ripemd160(
  keccak256(
    encodePacked(["string", "string"], [toB64(onchainInfo.salt_pin), pin]),
  ),
);

console.log("everyday login", {
  salt_pin: toB64(onchainInfo.salt_pin),
  pin,
  commitment_pin_onchain: onchainInfo.commitment_pin,
  commitment_pin_regenerated: pinCommitment2,
});

if (onchainInfo.commitment_pin !== pinCommitment2) {
  console.error("Invalid PIN");
  process.exit(1);
}

const stored = {
  salt_auth: toB64(onchainInfo.salt_auth),
  salt_wrap: toB64(onchainInfo.salt_wrap),
  salt_pin: toB64(onchainInfo.salt_pin),
  nonce: toB64(onchainInfo.nonce),
  seed: toB64(
    concatHex([
      onchainInfo.seed_head,
      onchainInfo.seed_word,
      onchainInfo.seed_tail,
    ]),
  ),
};

const { challenge: c2 } = generateRegisterChallenge(
  wallet.account.address,
  "1",
  stored.nonce,
);

const regenerated_signature = await wallet.signMessage({ message: c2 });

const { encryptionKey: ek2 } = regenerateEncryptionKey(
  regenerated_signature,
  pin,
  stored.salt_pin,
  stored.salt_auth,
  stored.salt_wrap,
  stored.seed,
  info,
);

console.log(ek2);
