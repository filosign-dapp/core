import {
  createPublicClient,
  encodePacked,
  keccak256,
  sliceHex,
  concatHex,
  type Hash,
  type PublicClient,
  http,
  ripemd160,
} from "viem";
import { filecoinCalibration } from "viem/chains";
import { getContracts } from "@filosign/contracts";
import {
  deriveEncryptionMaterial,
  generateNonce,
  generateRegisterChallenge,
  generateSalts,
  getPublicKeyFromRegenerated,
  regenerateEncryptionKey,
  toB64,
  toHex,
  ensureWasmInitialized,
} from "filosign-crypto-utils";
import { signRegisterChallenge } from "./utils/signature";
import type { Defaults, FilosignClientConfig, Wallet } from "./types/client";
import Logger from "./bindings/Logger";
import ApiClient from "./bindings/ApiClient";
import { Crypto } from "./bindings/Crypto";
import ShareCapability from "./bindings/ShareCapability";
import z from "zod";
import { privateKeyToAddress, signMessage } from "viem/accounts";
import { FilosignStore } from "./store";

const info = `Replace with relevant shit`; // temporary, todo replace
const primaryChain = filecoinCalibration;

export class FilosignClient {
  private wallet: Wallet;
  private publicClient: PublicClient;
  private contracts: ReturnType<typeof getContracts<Wallet>>;
  private crypto: Crypto;
  private defaults: Defaults;
  private logger: Logger;
  private apiClient: ApiClient;

  public version = 1;
  public store: FilosignStore;

  constructor(config: FilosignClientConfig) {
    const { wallet, apiBaseUrl } = config;

    this.wallet = wallet;
    this.contracts = getContracts(wallet);
    this.publicClient = createPublicClient({
      transport: http(this.wallet.chain.rpcUrls.default.http[0]),
      chain: wallet.chain,
    });
    this.apiClient = new ApiClient(apiBaseUrl);
    this.crypto = new Crypto();
    this.store = new FilosignStore({});

    this.logger = new Logger("FilosignClient", config.debug);
    this.defaults = {
      apiClient: this.apiClient,
      contracts: this.contracts,
      publicClient: this.publicClient,
      logger: this.logger,
      crypto: this.crypto,
      store: this.store,
      tx: async (txnPromise: Promise<Hash>) => {
        const hash = await txnPromise;
        return await this.publicClient.waitForTransactionReceipt({ hash });
      },
    };
  }

  async initialize() {
    try {
      await this.wallet.switchChain({ id: primaryChain.id });
    } catch (_) {}

    const promises = [
      this.contracts.FSManager.read.version(),
      ensureWasmInitialized(),
    ] as const;

    const [version] = await Promise.all(promises);
    this.version = version;
  }

  get address() {
    return this.wallet.account.address;
  }

  get shareCapability() {
    return new ShareCapability(this.defaults);
  }

  async isRegistered() {
    return await this.contracts.FSKeyRegistry.read.isRegistered([this.address]);
  }

  async register(options: { pin: string }) {
    const { pin } = options;
    console.log("REGISTER: pin", pin);

    if (await this.isRegistered()) {
      throw new Error("Address is already registered");
    }

    console.log("REGISTER: generating salts");
    const salts = generateSalts();
    console.log("REGISTER: salts generated", {
      pinSalt: salts.pinSalt,
      authSalt: salts.authSalt,
      wrapperSalt: salts.wrapperSalt,
    });

    console.log("REGISTER: generating nonce");
    const nonce = generateNonce();
    console.log("REGISTER: nonce generated", nonce);

    console.log("REGISTER: generating challenge");
    const { challenge } = generateRegisterChallenge(
      this.address,
      this.version.toString(),
      nonce,
    );
    console.log("REGISTER: challenge generated", challenge);

    console.log("REGISTER: signing challenge");
    const signature = await signRegisterChallenge({
      walletClient: this.wallet,
      challenge,
    });
    console.log("REGISTER: signature generated", signature);

    console.log("REGISTER: deriving encryption material");
    const { encSeed } = deriveEncryptionMaterial(
      signature.flat,
      pin,
      salts.pinSalt,
      salts.authSalt,
      salts.wrapperSalt,
      info,
    );
    console.log("REGISTER: encryption material derived");

    console.log("REGISTER: calculating pin commitment");
    const pinCommitment = ripemd160(
      keccak256(encodePacked(["string", "string"], [salts.pinSalt, pin])),
    );
    console.log("REGISTER: pinCommitment calculated", pinCommitment);

    console.log("REGISTER: preparing transaction data");
    const storedSalts = {
      pinSaltHex: `0x${toHex(salts.pinSalt)}`,
      authSaltHex: `0x${toHex(salts.authSalt)}`,
      wrapperSaltHex: `0x${toHex(salts.wrapperSalt)}`,
      nonceHex: `0x${toHex(nonce)}`,
    };
    console.log("REGISTER: stored salts hex", storedSalts);

    console.log("REGISTER: getting public key");
    const { publicKey } = getPublicKeyFromRegenerated(
      signature.flat,
      pin,
      salts.pinSalt,
      salts.authSalt,
      salts.wrapperSalt,
      encSeed,
      info,
    );
    console.log("REGISTER: public key obtained", `0x${toHex(publicKey)}`);

    const encSeedHex = `0x${toHex(encSeed)}` as const;
    console.log("REGISTER: encSeedHex", encSeedHex);

    console.log("REGISTER: executing registerKeygenData transaction");
    await this.defaults.tx(
      this.contracts.FSKeyRegistry.write.registerKeygenData([
        {
          nonce: `0x${toHex(nonce)}`,
          salt_pin: `0x${toHex(salts.pinSalt)}`,
          salt_auth: `0x${toHex(salts.authSalt)}`,
          salt_wrap: `0x${toHex(salts.wrapperSalt)}`,
          seed_head: sliceHex(encSeedHex, 0, 20),
          seed_word: sliceHex(encSeedHex, 20, 52),
          seed_tail: sliceHex(encSeedHex, 52, 72),
          commitment_pin: pinCommitment,
        },
        `0x${toHex(publicKey)}`,
      ]),
    );
    console.log("REGISTER: transaction completed");

    console.log("REGISTER: regenerating encryption key");
    const { encryptionKey } = regenerateEncryptionKey(
      signature.flat,
      pin,
      salts.pinSalt,
      salts.authSalt,
      salts.wrapperSalt,
      encSeed,
      info,
    );
    console.log("REGISTER: encryption key regenerated");

    console.log("REGISTER: setting crypto encryption key");
    this.crypto.encryptionKey = Uint8Array.fromBase64(encryptionKey);

    console.log("REGISTER: requesting JWT");
    await this.requestAndSetJwt();
    console.log("REGISTER: registration completed successfully");
  }

  async login(options: { pin: string }) {
    const { pin } = options;
    console.log("LOGIN: pin", pin);

    console.log("LOGIN: checking if registered");
    if (!(await this.isRegistered())) {
      throw new Error("Address is not registered");
    }
    console.log("LOGIN: user is registered");

    console.log("LOGIN: fetching keygen data from contract");
    const [
      stored_salt_auth,
      stored_salt_wrap,
      stored_salt_pin,
      stored_nonce,
      stored_seed_head,
      stored_seed_word,
      stored_seed_tail,
      stored_commitment_pin,
    ] = await this.contracts.FSKeyRegistry.read.keygenData([this.address]);
    console.log("LOGIN: raw keygen data from contract", {
      stored_salt_auth,
      stored_salt_wrap,
      stored_salt_pin,
      stored_nonce,
      stored_seed_head,
      stored_seed_word,
      stored_seed_tail,
      stored_commitment_pin,
    });

    console.log("LOGIN: converting stored salts to base64");
    const convertedSalts = {
      salt_auth: toB64(stored_salt_auth),
      salt_wrap: toB64(stored_salt_wrap),
      salt_pin: toB64(stored_salt_pin),
      nonce: toB64(stored_nonce),
    };
    console.log("LOGIN: converted salts", convertedSalts);

    console.log("LOGIN: calculating pin commitment for validation");
    const pinCommitment = ripemd160(
      keccak256(
        encodePacked(["string", "string"], [convertedSalts.salt_pin, pin]),
      ),
    );
    console.log("LOGIN: calculated pinCommitment", pinCommitment);
    console.log("LOGIN: stored_commitment_pin", stored_commitment_pin);

    console.log("LOGIN: comparing pin commitments");
    if (stored_commitment_pin !== pinCommitment) {
      console.error("LOGIN: PIN commitment mismatch!", {
        calculated: pinCommitment,
        stored: stored_commitment_pin,
        pin,
        salt_pin_b64: convertedSalts.salt_pin,
        salt_pin_hex: stored_salt_pin,
      });
      throw new Error("Invalid PIN");
    }
    console.log("LOGIN: PIN commitment validation passed");

    console.log("LOGIN: reconstructing stored data");
    const stored = {
      salt_auth: toB64(stored_salt_auth),
      salt_wrap: toB64(stored_salt_wrap),
      salt_pin: toB64(stored_salt_pin),
      nonce: toB64(stored_nonce),
      seed: toB64(
        concatHex([stored_seed_head, stored_seed_word, stored_seed_tail]),
      ),
    };
    console.log("LOGIN: reconstructed stored data", stored);

    console.log("LOGIN: generating challenge for signature regeneration");
    const { challenge } = generateRegisterChallenge(
      this.address,
      this.version.toString(),
      stored.nonce,
    );
    console.log("LOGIN: challenge generated", challenge);

    console.log("LOGIN: regenerating signature");
    const regenerated_signature = await signRegisterChallenge({
      walletClient: this.wallet,
      challenge,
    });
    console.log("LOGIN: signature regenerated", regenerated_signature);

    console.log("LOGIN: regenerating encryption key");
    const { encryptionKey } = regenerateEncryptionKey(
      regenerated_signature.flat,
      pin,
      stored.salt_pin,
      stored.salt_auth,
      stored.salt_wrap,
      stored.seed,
      info,
    );
    console.log("LOGIN: encryption key regenerated");

    console.log("LOGIN: setting crypto encryption key");
    this.crypto.encryptionKey = Uint8Array.fromBase64(encryptionKey);

    console.log("LOGIN: requesting JWT");
    await this.requestAndSetJwt();
    console.log("LOGIN: login completed successfully");
  }

  async requestAndSetJwt() {
    console.log("JWT: requesting JWT");
    if (!this.crypto.encryptionKey) {
      throw new Error("Client is not logged in");
    }

    console.log("JWT: deriving address from encryption key");
    const derivedAddress = privateKeyToAddress(
      `0x${this.crypto.encryptionKey.toHex()}`,
    );
    console.log("JWT: derived address", derivedAddress);

    console.log("JWT: requesting nonce from server");
    const nonce = await this.apiClient.rpc.getSafe(
      { nonce: z.string() },
      "/auth/nonce",
      {
        params: {
          address: derivedAddress,
        },
      },
    );
    console.log("JWT: nonce received", nonce.data.nonce);

    console.log("JWT: signing nonce with encryption key");
    const signature = signMessage({
      message: nonce.data.nonce,
      privateKey: `0x${this.crypto.encryptionKey.toHex()}`,
    });
    console.log("JWT: signature created", signature);

    console.log("JWT: requesting JWT token from server");
    const jwt = await this.apiClient.rpc.getSafe(
      { token: z.string() },
      "/auth/verify",
      {
        params: {
          address: this.address,
          signature: signature,
        },
      },
    );
    console.log("JWT: JWT token received");

    console.log("JWT: setting JWT in API client");
    this.apiClient.setJwt(jwt.data.token);
    console.log("JWT: JWT setup completed");
  }
}
