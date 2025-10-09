import { useFilosignMutation, useFilosignQuery } from "@filosign/sdk/react";
import { EyeIcon, SpinnerIcon, UserCheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../../../lib/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../lib/components/ui/card";
import { Input } from "../../../lib/components/ui/input";
import { Label } from "../../../lib/components/ui/label";

export function ShareReceiverTest() {
	// Receiver's side
	const allowSharing = useFilosignMutation(["shareCapability", "allowSharing"]);
	const allowedList = useFilosignQuery(
		["shareCapability", "getPeopleCanReceiveFrom"],
		undefined,
	);
	const receivedShareRequests = useFilosignQuery(
		["shareCapability", "getReceivedRequests"],
		undefined,
	);

	// Input states for shareCapability testing
	const [senderWalletToAllow, setSenderWalletToAllow] = useState("");

	async function handleAllowSharing() {
		if (!senderWalletToAllow.trim()) return;
		try {
			await allowSharing.mutateAsync({
				senderWallet: senderWalletToAllow as `0x${string}`,
			});
			console.log("Allowed sharing");
			setSenderWalletToAllow("");
		} catch (error) {
			console.error("Failed to allow sharing", error);
		}
	}

	return (
		<div className="space-y-6">
			{/* Allow Sharing */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserCheckIcon className="w-5 h-5" />
						Allow Sharing
					</CardTitle>
					<CardDescription>
						Allow a sender to share documents with you
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<Label htmlFor="allow-sender-address">Sender Wallet Address</Label>
						<Input
							id="allow-sender-address"
							placeholder="0x..."
							value={senderWalletToAllow}
							onChange={(e) => setSenderWalletToAllow(e.target.value)}
						/>
					</div>
					<Button
						onClick={handleAllowSharing}
						disabled={!senderWalletToAllow.trim() || allowSharing.isPending}
						className="w-full"
						size="lg"
					>
						{allowSharing.isPending ? (
							<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<UserCheckIcon className="w-4 h-4 mr-2" />
						)}
						Allow Sharing
					</Button>
				</CardContent>
			</Card>

			{/* Receiver Data Display */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Received Requests</CardTitle>
							<Button
								onClick={() => receivedShareRequests.refetch()}
								disabled={receivedShareRequests.isFetching}
								variant="outline"
								size="sm"
							>
								{receivedShareRequests.isFetching ? (
									<SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
								) : (
									<EyeIcon className="w-3 h-3 mr-1" />
								)}
								Refetch
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
							{receivedShareRequests.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading...
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(receivedShareRequests.data || [], null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Can Receive From</CardTitle>
							<Button
								onClick={() => allowedList.refetch()}
								disabled={allowedList.isFetching}
								variant="outline"
								size="sm"
							>
								{allowedList.isFetching ? (
									<SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
								) : (
									<EyeIcon className="w-3 h-3 mr-1" />
								)}
								Refetch
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
							{allowedList.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading...
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(allowedList.data || [], null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
