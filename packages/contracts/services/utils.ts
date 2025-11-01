import {
	type Account,
	type Address,
	type Chain,
	encodePacked,
	type Hex,
	keccak256,
	pad,
	parseSignature,
	type Transport,
	type WalletClient,
} from "viem";
import type { SignTypedDataParameters } from "viem/accounts";
import type { FilosignContracts } from "./contracts";

export function parsePieceCid(pieceCid: string) {
	const bytes = new TextEncoder().encode(pieceCid);
	const hex = `0x${bytes.toHex()}` as const;

	const p1_bytes32 = `0x${hex.slice(2, 2 + 32 * 2)}` as const;

	const p2_bytes16 = `0x${hex.slice(2 + 32 * 2, 2 + 32 * 2 + 16 * 2)}` as const;

	const remainingHex = hex.slice(2 + 32 * 2 + 16 * 2);
	const p3_bytes32 = pad(`0x${remainingHex}`, {
		size: 32,
	});

	return {
		digestPrefix: p1_bytes32,
		digestBuffer: p2_bytes16,
		digestTail: p3_bytes32,
		length: bytes.length,
	};
}

export function rebuildPieceCid(options: {
	digestPrefix: Hex;
	digestBuffer: Hex;
	digestTail: Hex;
}) {
	const tailHex = options.digestTail.slice(2).replace(/^0+/, "");
	const reconstructedHex = `0x${options.digestPrefix.slice(2)}${options.digestBuffer.slice(2)}${tailHex}`;

	const reconstruct = Uint8Array.fromHex(reconstructedHex.slice(2));
	const reconstructedString = new TextDecoder().decode(reconstruct);

	return reconstructedString;
}

export function computeCidIdentifier(pieceCid: string) {
	return keccak256(
		encodePacked(
			["string"],
			[pieceCid],
		),
	);
}

export async function eip712signature(
	contracts: FilosignContracts,
	contractName: keyof Pick<FilosignContracts, "FSFileRegistry">,
	args: Omit<SignTypedDataParameters, "domain" | "privateKey">,
) {
	// const domain = {
	// 	name: contractName,
	// 	version: "1",
	// 	chainId: contracts.$client.chain.id,
	// 	verifyingContract: contracts[contractName].address,
	// };

	const domain = await contracts[contractName].read.eip712Domain();

	return contracts.$client.signTypedData({
		domain: {
			name: domain[1],
			version: domain[2],
			chainId: domain[3],
			verifyingContract: domain[4],
			salt: domain[5],
		},
		...args,
	});
}

export async function signFileSignature(options: {
	walletClient: WalletClient<Transport, Chain, Account>;
	contractAddress: Address;
	pieceCid: string;
	signatureVisualHash: Hex;
}) {
	const domain = {
		name: "Filosign File Registry",
		version: "1",
		chainId: options.walletClient.chain.id,
		verifyingContract: options.contractAddress,
	};

	const types = {
		Signature: [
			{ name: "pieceCidPrefix", type: "bytes32" },
			{ name: "pieceCidBuffer", type: "bytes16" },
			{ name: "pieceCidTail", type: "bytes32" },
			{ name: "signatureVisualHash", type: "bytes32" },
		],
	};

	const {
		digestPrefix: pieceCidPrefix,
		digestBuffer: pieceCidBuffer,
		digestTail: pieceCidTail,
	} = parsePieceCid(options.pieceCid);

	const value = {
		pieceCidPrefix: pieceCidPrefix,
		pieceCidBuffer: pieceCidBuffer,
		pieceCidTail: pieceCidTail,
		signatureVisualHash: options.signatureVisualHash,
	};

	const flatSig = await options.walletClient.signTypedData({
		types,
		domain,
		message: value,
		primaryType: "Signature",
	});

	const sig = parseSignature(flatSig);
	return {
		v: sig.v,
		r: sig.r,
		s: sig.s,
		flat: flatSig,
	};
}
