const DB_NAME = "secure-keys-db";
const STORE_NAME = "keys";

function idbOpen() {
	return new Promise<IDBDatabase>((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, 1);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

async function idbPut(keyName: string, value: any) {
	const db = await idbOpen();
	return new Promise<void>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readwrite");
		tx.objectStore(STORE_NAME).put(value, keyName);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

async function idbGet(keyName: string) {
	const db = await idbOpen();
	return new Promise<any>((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, "readonly");
		const req = tx.objectStore(STORE_NAME).get(keyName);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

// generate and persist non-extractable AES-GCM key
export async function generateAndStoreKey(keyName = "local-aes-key") {
	const key = await crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		false, // extractable = false  <-- IMPORTANT
		["encrypt", "decrypt"],
	);
	// Storing CryptoKey via structured clone in IndexedDB works in modern browsers
	await idbPut(keyName, key);
	return true;
}

// retrieve CryptoKey from IndexedDB
export async function getKey(
	keyName = "local-aes-key",
): Promise<CryptoKey | null> {
	const k = await idbGet(keyName);
	return k ?? null;
}

// utility encrypt/decrypt
export async function encryptWithStoredKey(
	plaintext: Uint8Array,
	keyName = "local-aes-key",
) {
	const key = await getKey(keyName);
	if (!key) throw new Error("key not found");
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ct = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		plaintext,
	);
	return { iv: new Uint8Array(iv), ciphertext: new Uint8Array(ct) };
}

export async function decryptWithStoredKey(
	iv: Uint8Array,
	ciphertext: Uint8Array,
	keyName = "local-aes-key",
) {
	const key = await getKey(keyName);
	if (!key) throw new Error("key not found");
	const pt = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		ciphertext,
	);
	return new Uint8Array(pt);
}
