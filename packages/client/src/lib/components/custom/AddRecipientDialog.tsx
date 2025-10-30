import { useFilosignMutation } from "@filosign/react";
import {
	EnvelopeIcon,
	PlusIcon,
	WalletIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { isAddress } from "viem";
import { Button } from "@/src/lib/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/src/lib/components/ui/dialog";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import { Textarea } from "@/src/lib/components/ui/textarea";

interface AddRecipientDialogProps {
	trigger?: React.ReactNode;
	onSuccess?: () => void;
}

export default function AddRecipientDialog({
	trigger,
	onSuccess,
}: AddRecipientDialogProps) {
	const [open, setOpen] = useState(false);
	const [walletAddress, setWalletAddress] = useState("");
	const [message, setMessage] = useState("");

	const sendShareRequest = useFilosignMutation([
		"shareCapability",
		"sendShareRequest",
	]);

	console.log(sendShareRequest.isPending);

	const handleSendRequest = async () => {
		if (!isAddress(walletAddress)) {
			toast.error("Please enter a valid wallet address");
			return;
		}

		try {
			await sendShareRequest.mutateAsync({
				recipientWallet: walletAddress,
				message: message.trim() || "",
			});

			toast.success("Share request sent successfully!");

			// Reset form and close dialog
			setWalletAddress("");
			setMessage("");
			setOpen(false);
			onSuccess?.();
		} catch (error) {
			console.error("Failed to send share request:", error);
			toast.error("Failed to send share request. Please try again.");
		}
	};

	const handleClose = () => {
		setWalletAddress("");
		setMessage("");
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="primary" size="sm">
						<PlusIcon className="w-4 h-4 mr-2" />
						Add Recipient
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Recipient</DialogTitle>
					<DialogDescription>
						Send a share request to allow someone to receive documents from you.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Wallet Address Input */}
					<div className="space-y-2">
						<Label htmlFor="wallet-address" className="flex items-center gap-2">
							<WalletIcon className="w-4 h-4" />
							Wallet Address *
						</Label>
						<Input
							id="wallet-address"
							placeholder="0x..."
							value={walletAddress}
							onChange={(e) => setWalletAddress(e.target.value)}
							className="font-mono"
						/>
					</div>

					{/* Message Input */}
					<div className="space-y-2">
						<Label htmlFor="message" className="flex items-center gap-2">
							<EnvelopeIcon className="w-4 h-4" />
							Message (optional)
						</Label>
						<Textarea
							id="message"
							placeholder="Add a personal message with your request..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<div className="flex justify-end gap-3">
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSendRequest}
						disabled={sendShareRequest.isPending || !walletAddress.trim()}
					>
						{sendShareRequest.isPending ? "Sending..." : "Send Request"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
