import { getContracts } from "@filosign/contracts";
import {
	deriveEncryptionMaterial,
	ensureWasmInitialized,
	generateNonce,
	generateRegisterChallenge,
	generateSalts,
	getPublicKeyFromRegenerated,
	regenerateEncryptionKey,
	toB64,
	toHex,
} from "filosign-crypto-utils";
import {
	concatHex,
	createPublicClient,
	encodePacked,
	type Hash,
	http,
	isHash,
	keccak256,
	type PublicClient,
	ripemd160,
	sliceHex,
} from "viem";
import { publicKeyToAddress } from "viem/accounts";
import { filecoinCalibration } from "viem/chains";
import z from "zod";
import ApiClient from "./bindings/ApiClient";
import { Crypto } from "./bindings/Crypto";
import Files from "./bindings/Files";
import Logger from "./bindings/Logger";
import ShareCapability from "./bindings/ShareCapability";
import { FilosignStore } from "./store";
import type { Defaults, FilosignClientConfig, Wallet } from "./types/client";
import { signRegisterChallenge } from "./utils/signature";

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
			wallet: this.wallet,
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

	get files() {
		return new Files(this.defaults);
	}

	get profile() {
		return this.store.profile;
	}

	async isRegistered() {
		return await this.contracts.FSKeyRegistry.read.isRegistered([this.address]);
	}

	async isLoggedIn() {
		return !!this.crypto.encryptionPublicKey && !!this.apiClient.jwtExists;
	}

	async logout() {
		this.crypto.encryptionKey = null;
		this.apiClient.setJwt(null);
		console.log("Logged out");
	}

	async register(options: { pin: string }) {
		const { pin } = options;

		if (await this.isRegistered()) {
			throw new Error("Address is already registered");
		}

		const salts = generateSalts();

		const nonce = generateNonce();

		const { challenge } = generateRegisterChallenge(
			this.address,
			this.version.toString(),
			nonce,
		);

		const signature = await signRegisterChallenge({
			walletClient: this.wallet,
			challenge,
		});

		const { encSeed } = deriveEncryptionMaterial(
			signature.flat,
			pin,
			salts.pinSalt,
			salts.authSalt,
			salts.wrapperSalt,
			info,
		);

		const pinCommitment = ripemd160(
			keccak256(encodePacked(["string", "string"], [salts.pinSalt, pin])),
		);

		const storedSalts = {
			pinSaltHex: `0x${toHex(salts.pinSalt)}`,
			authSaltHex: `0x${toHex(salts.authSalt)}`,
			wrapperSaltHex: `0x${toHex(salts.wrapperSalt)}`,
			nonceHex: `0x${toHex(nonce)}`,
		};

		const { publicKey } = getPublicKeyFromRegenerated(
			signature.flat,
			pin,
			salts.pinSalt,
			salts.authSalt,
			salts.wrapperSalt,
			encSeed,
			info,
		);

		const encSeedHex = `0x${toHex(encSeed)}` as const;

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

		const { encryptionKey } = regenerateEncryptionKey(
			signature.flat,
			pin,
			salts.pinSalt,
			salts.authSalt,
			salts.wrapperSalt,
			encSeed,
			info,
		);

		this.crypto.encryptionKey = Uint8Array.fromBase64(encryptionKey);

		await this.requestAndSetJwt();
	}

	async login(options: { pin: string }) {
		const { pin } = options;

		if (!(await this.isRegistered())) {
			throw new Error("Address is not registered");
		}

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

		const convertedSalts = {
			salt_auth: toB64(stored_salt_auth),
			salt_wrap: toB64(stored_salt_wrap),
			salt_pin: toB64(stored_salt_pin),
			nonce: toB64(stored_nonce),
		};

		const pinCommitment = ripemd160(
			keccak256(
				encodePacked(["string", "string"], [convertedSalts.salt_pin, pin]),
			),
		);

		if (stored_commitment_pin !== pinCommitment) {
			throw new Error("Invalid PIN");
		}

		const stored = {
			salt_auth: toB64(stored_salt_auth),
			salt_wrap: toB64(stored_salt_wrap),
			salt_pin: toB64(stored_salt_pin),
			nonce: toB64(stored_nonce),
			seed: toB64(
				concatHex([stored_seed_head, stored_seed_word, stored_seed_tail]),
			),
		};

		const { challenge } = generateRegisterChallenge(
			this.address,
			this.version.toString(),
			stored.nonce,
		);

		const regenerated_signature = await signRegisterChallenge({
			walletClient: this.wallet,
			challenge,
		});

		const { encryptionKey } = regenerateEncryptionKey(
			regenerated_signature.flat,
			pin,
			stored.salt_pin,
			stored.salt_auth,
			stored.salt_wrap,
			stored.seed,
			info,
		);

		const { publicKey } = getPublicKeyFromRegenerated(
			regenerated_signature.flat,
			pin,
			stored.salt_pin,
			stored.salt_auth,
			stored.salt_wrap,
			stored.seed,
			info,
		);

		this.crypto.encryptionKey = Uint8Array.fromBase64(encryptionKey);

		await this.requestAndSetJwt();
	}

	async requestAndSetJwt() {
		if (!this.crypto.encryptionPublicKey) {
			throw new Error(
				"Encryption public key is not set which means pvtKey was also not set so cant reqest jwt",
			);
		}

		const derivedAddress = publicKeyToAddress(this.crypto.encryptionPublicKey);

		const nonce = await this.apiClient.rpc.getSafe(
			{ nonce: z.string() },
			"/auth/nonce",
			{
				params: {
					address: derivedAddress,
				},
			},
		);

		const nonceHash = nonce.data.nonce;
		if (!isHash(nonceHash)) {
			throw new Error("Invalid nonce");
		}

		const signature = await this.crypto.signMessage(nonceHash);
		console.log(signature, nonceHash, this.crypto.encryptionPublicKey);

		const publicKey = this.crypto.encryptionPublicKey;

		const jwt = await this.apiClient.rpc.getSafe(
			{ token: z.string() },
			"/auth/verify",
			{
				params: {
					address: derivedAddress,
					pub_key: publicKey,
					signature: `0x${signature}`,
				},
			},
		);

		this.apiClient.setJwt(jwt.data.token);
	}
}
