import { useFilosignContext } from "../../react-sdk";

function App() {
	const { ready, wallet } = useFilosignContext();

	if (!ready) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			<h1>Hello Filosign!</h1>
			<p>Wallet address: {wallet?.account.address}</p>
		</div>
	);
}

export default App;
