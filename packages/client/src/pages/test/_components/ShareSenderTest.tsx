import { useFilosignMutation, useFilosignQuery } from "@filosign/sdk/react";
import {
	EyeIcon,
	PaperPlaneIcon,
	SpinnerIcon,
	XIcon,
} from "@phosphor-icons/react";
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

export function ShareSenderTest() {
	// Sender's side
	const sendShareRequest = useFilosignMutation([
		"shareCapability",
		"sendShareRequest",
	]);
	const cancelShareRequest = useFilosignMutation([
		"shareCapability",
		"cancelShareRequest",
	]);
	const sentShareRequests = useFilosignQuery(
		["shareCapability", "getSentRequests"],
		undefined,
	);
	const allowedListSender = useFilosignQuery(
		["shareCapability", "getPeopleCanSendTo"],
		undefined,
	);

	// Input states for shareCapability testing
	const [sendToAddress, setSendToAddress] = useState("");
	const [sendMessage, setSendMessage] = useState("");
	const [requestIdToCancel, setRequestIdToCancel] = useState("");

	async function handleSendShareRequest() {
		if (!sendToAddress.trim() || !sendMessage.trim()) return;
		try {
			await sendShareRequest.mutateAsync({
				recipientWallet: sendToAddress as `0x${string}`,
				message: sendMessage,
			});
			console.log("Sent share request");
			setSendToAddress("");
			setSendMessage("");
		} catch (error) {
			console.error("Failed to send share request", error);
		}
	}

	async function handleCancelShareRequest() {
		if (!requestIdToCancel.trim()) return;
		try {
			await cancelShareRequest.mutateAsync({ requestId: requestIdToCancel });
			console.log("Cancelled share request");
			setRequestIdToCancel("");
		} catch (error) {
			console.error("Failed to cancel share request", error);
		}
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Send Share Request */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<PaperPlaneIcon className="w-5 h-5" />
							Send Share Request
						</CardTitle>
						<CardDescription>
							Send a sharing request to another wallet
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="recipient-address">
									Recipient Wallet Address
								</Label>
								<Input
									id="recipient-address"
									placeholder="0x..."
									value={sendToAddress}
									onChange={(e) => setSendToAddress(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="share-message">Message</Label>
								<Input
									id="share-message"
									placeholder="Enter your message..."
									value={sendMessage}
									onChange={(e) => setSendMessage(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleSendShareRequest}
								disabled={
									!sendToAddress.trim() ||
									!sendMessage.trim() ||
									sendShareRequest.isPending
								}
								className="w-full"
								size="lg"
							>
								{sendShareRequest.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<PaperPlaneIcon className="w-4 h-4 mr-2" />
								)}
								Send Request
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Cancel Share Request */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<XIcon className="w-5 h-5" />
							Cancel Share Request
						</CardTitle>
						<CardDescription>
							Cancel a previously sent sharing request
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<Label htmlFor="cancel-request-id">Request ID</Label>
							<Input
								id="cancel-request-id"
								placeholder="Enter request ID..."
								value={requestIdToCancel}
								onChange={(e) => setRequestIdToCancel(e.target.value)}
							/>
						</div>
						<Button
							onClick={handleCancelShareRequest}
							disabled={
								!requestIdToCancel.trim() || cancelShareRequest.isPending
							}
							variant="destructive"
							className="w-full"
							size="lg"
						>
							{cancelShareRequest.isPending ? (
								<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<XIcon className="w-4 h-4 mr-2" />
							)}
							Cancel Request
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Sender Data Display */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Sent Requests</CardTitle>
							<Button
								onClick={() => sentShareRequests.refetch()}
								disabled={sentShareRequests.isFetching}
								variant="outline"
								size="sm"
							>
								{sentShareRequests.isFetching ? (
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
							{sentShareRequests.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading...
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(sentShareRequests.data || [], null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Can Send To</CardTitle>
							<Button
								onClick={() => allowedListSender.refetch()}
								disabled={allowedListSender.isFetching}
								variant="outline"
								size="sm"
							>
								{allowedListSender.isFetching ? (
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
							{allowedListSender.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading...
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(allowedListSender.data || [], null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
