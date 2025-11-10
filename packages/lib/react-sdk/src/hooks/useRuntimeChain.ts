import { useFilosignContext } from "../context/FilosignProvider";

export function useRuntimeChain() {
	const { contracts } = useFilosignContext();

	if (!contracts) {
		throw new Error(
			"Filosign runtime are not initialized yet. did you forget to add FilosignProvider? did you forget to wait for ready?",
		);
	}

	return contracts.$client.chain;
}
