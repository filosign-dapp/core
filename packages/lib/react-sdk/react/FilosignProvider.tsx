import { openDB } from "idb";
import {
	createContext,
	createElement,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { FilosignClient } from "../..";
import type { FilosignClientConfig } from "../../types/client";

type FilosignContext = {
	client: FilosignClient;
	ready: boolean;
};

const FilosignContext = createContext<FilosignContext>({
	client: {} as any,
	ready: false,
});

type FilosignConfig = {
	children: ReactNode;
	config: {
		wallet?: FilosignClientConfig["wallet"];
		apiBaseUrl: FilosignClientConfig["apiBaseUrl"];
		debug?: FilosignClientConfig["debug"];
	};
};

export function FilosignProvider(props: FilosignConfig) {
	const { children, config } = props;
	const [client, setClient] = useState<FilosignClient>({} as any);
	const [ready, setReady] = useState<boolean>(false);

	const flag = useRef(false);

	const value: FilosignContext = {
		client,
		ready,
	};

	useEffect(() => {
		if (!flag.current && config.wallet) {
			flag.current = true;

			const fsClient = new FilosignClient({
				apiBaseUrl: config.apiBaseUrl,
				wallet: config.wallet,
				debug: config.debug,
			});

			fsClient.store.cache = {
				get: async (key: string) => {
					try {
						const db = await getDB();
						return await db.get("cache", key);
					} catch (error) {
						console.error("Cache get error:", error);
						return null;
					}
				},
				set: async (key: string, value: string) => {
					try {
						const db = await getDB();
						await db.put("cache", value, key);
					} catch (error) {
						console.error("Cache set error:", error);
					}
				},
				delete: async (key: string) => {
					try {
						const db = await getDB();
						await db.delete("cache", key);
					} catch (error) {
						console.error("Cache delete error:", error);
					}
				},
			};
			fsClient.store.cache.set("key", "value");

			fsClient.initialize().then(() => setReady(true));

			setClient(fsClient);
		}
	}, [config, config.wallet]);

	return createElement(FilosignContext.Provider, { value }, children);
}

export function useFilosignContext() {
	return useContext(FilosignContext);
}

let dbPromise: any;
async function getDB() {
	if (!dbPromise) {
		dbPromise = openDB("my-cache-db", 2, {
			upgrade(db, oldVersion) {
				if (oldVersion < 1) {
					if (!db.objectStoreNames.contains("cache")) {
						db.createObjectStore("cache");
					}
				}
				if (oldVersion < 2) {
					if (db.objectStoreNames.contains("cache")) {
						db.deleteObjectStore("cache");
					}
					db.createObjectStore("cache");
				}
			},
		}).catch(async (error) => {
			console.error("Failed to open database:", error);
			dbPromise = null;

			try {
				const deleteReq = indexedDB.deleteDatabase("my-cache-db");
				await new Promise((resolve, reject) => {
					deleteReq.onsuccess = () => resolve(undefined);
					deleteReq.onerror = () => reject(deleteReq.error);
				});
				console.log("Database deleted, reting");

				return openDB("my-cache-db", 2, {
					upgrade(db) {
						if (!db.objectStoreNames.contains("cache")) {
							db.createObjectStore("cache");
						}
					},
				});
			} catch (deleteError) {
				console.error("Failed to delete and recreate database:", deleteError);
				throw deleteError;
			}
		});
	}
	return dbPromise;
}
