import { useFilosignMutation, useFilosignQuery } from "@filosign/react";
import {
	ArrowClockwiseIcon,
	BellIcon,
	CheckCircleIcon,
	FileTextIcon,
	UserCheckIcon,
} from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/src/lib/components/ui/alert-dialog";
import { Badge } from "@/src/lib/components/ui/badge";
import { Button } from "@/src/lib/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/src/lib/components/ui/popover";
import { Separator } from "@/src/lib/components/ui/separator";
import { NotificationItemCard } from "./notification-item-card";

export function NotificationsPopover() {
	const [open, setOpen] = useState(false);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [pendingAcceptWallet, setPendingAcceptWallet] = useState<string | null>(
		null,
	);
	const queryClient = useQueryClient();

	// Only get the actionable data - pending requests and unacknowledged files
	const receivedRequests = useFilosignQuery(
		["shareCapability", "getReceivedRequests"],
		undefined,
	);
	const receivedFiles = useFilosignQuery(
		["files", "getReceivedFiles"],
		undefined,
	);
	const acknowledgeFile = useFilosignMutation(["files", "acknowledgeFile"]);
	const allowSharing = useFilosignMutation(["shareCapability", "allowSharing"]);

	// Calculate notification counts - only actionable items
	const getNotificationCount = () => {
		let count = 0;

		// Count unacknowledged received files
		if (receivedFiles.data && Array.isArray(receivedFiles.data)) {
			count += receivedFiles.data.filter(
				(file: any) => !file.acknowledged,
			).length;
		}

		// Count pending received requests - check both data.requests and data directly
		const requestsData =
			(receivedRequests.data as any)?.requests || receivedRequests.data;
		if (requestsData && Array.isArray(requestsData)) {
			count += requestsData.filter(
				(req: any) => req.status === "PENDING" || req.status === "pending",
			).length;
		}

		return count;
	};

	const notificationCount = getNotificationCount();

	const formatAddress = (address: string) => {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const handleAcknowledgeFile = async (pieceCid: string) => {
		try {
			await acknowledgeFile.mutateAsync({ pieceCid });
			toast.success("File acknowledged!");
			// Refresh the files list
			await queryClient.invalidateQueries({
				queryKey: ["filosign", "files", "getReceivedFiles"],
			});
		} catch (error) {
			toast.error("Failed to acknowledge file");
		}
	};

	const handleAllowSharing = (senderWallet: string) => {
		setPendingAcceptWallet(senderWallet);
		setConfirmDialogOpen(true);
	};

	const confirmAllowSharing = async () => {
		if (!pendingAcceptWallet) return;

		console.log("Attempting to allow sharing for wallet:", pendingAcceptWallet);
		try {
			console.log("Calling allowSharing.mutateAsync with:", {
				senderWallet: pendingAcceptWallet,
			});
			const result = await allowSharing.mutateAsync({
				senderWallet: pendingAcceptWallet,
			});
			console.log("allowSharing result:", result);
			toast.success("Sharing request accepted!");
			// Refresh the requests list
			await queryClient.invalidateQueries({
				queryKey: ["filosign", "shareCapability", "getReceivedRequests"],
			});
			console.log("Queries invalidated");
			setConfirmDialogOpen(false);
			setPendingAcceptWallet(null);
		} catch (error) {
			console.error("Failed to accept sharing request:", error);
			toast.error("Failed to accept sharing request");
		}
	};

	const pendingRequests = (() => {
		const requestsData =
			(receivedRequests.data as any)?.requests || receivedRequests.data;
		return requestsData && Array.isArray(requestsData)
			? requestsData.filter(
				(req: any) => req.status === "PENDING" || req.status === "pending",
			)
			: [];
	})();

	const unacknowledgedFiles =
		receivedFiles.data && Array.isArray(receivedFiles.data)
			? receivedFiles.data.filter((file: any) => !file.acknowledged)
			: [];

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="default" className="relative">
					<BellIcon className="h-5 w-5" />
					{notificationCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
						>
							{notificationCount > 9 ? "9+" : notificationCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-96 p-0" align="end">
				<div className="p-4 border-b">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-semibold">Notifications</h3>
							<p className="text-sm text-muted-foreground">
								{notificationCount > 0
									? `${notificationCount} pending action${notificationCount > 1 ? "s" : ""}`
									: "You're all caught up!"}
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								receivedRequests.refetch();
								receivedFiles.refetch();
							}}
							disabled={receivedRequests.isFetching || receivedFiles.isFetching}
							className="h-6 w-6 p-0"
						>
							<ArrowClockwiseIcon className="h-3 w-3" />
						</Button>
					</div>
				</div>

				<div className="max-h-96 overflow-y-auto">
					{/* Loading State */}
					{(receivedRequests.isLoading || receivedFiles.isLoading) && (
						<div className="p-8 text-center">
							<div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
							<p className="text-sm text-muted-foreground">
								Loading notifications...
							</p>
						</div>
					)}

					{/* Pending Sharing Requests */}
					{pendingRequests.length > 0 && (
						<div className="p-4">
							<div className="flex items-center gap-2 mb-4">
								<UserCheckIcon className="h-4 w-4 text-orange-600" />
								<h4 className="text-sm font-semibold">Sharing Requests</h4>
								<Badge
									variant="secondary"
									className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
								>
									{pendingRequests.length}
								</Badge>
							</div>

							<div className="space-y-3">
								{pendingRequests.map((req: any, i: number) => (
									<NotificationItemCard
										key={i}
										icon={<UserCheckIcon className="h-4 w-4 text-orange-600" />}
										title={`From: ${formatAddress(req.senderWallet)}`}
										subtitle={req.message || "No message provided"}
										variant="warning"
										actionButton={{
											label: allowSharing.isPending ? "Accepting..." : "Accept",
											onClick: () => handleAllowSharing(req.senderWallet),
											loading: allowSharing.isPending,
											variant: "default",
										}}
									/>
								))}
							</div>
						</div>
					)}

					{/* Unacknowledged Files */}
					{unacknowledgedFiles.length > 0 && (
						<div className="p-4">
							{pendingRequests.length > 0 && <Separator className="mb-4" />}

							<div className="flex items-center gap-2 mb-4">
								<FileTextIcon className="h-4 w-4 text-blue-600" />
								<h4 className="text-sm font-semibold">Files to Acknowledge</h4>
								<Badge
									variant="secondary"
									className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
								>
									{unacknowledgedFiles.length}
								</Badge>
							</div>

							<div className="space-y-3">
								{unacknowledgedFiles.map((file: any, i: number) => (
									<NotificationItemCard
										key={i}
										icon={<FileTextIcon className="h-4 w-4 text-blue-600" />}
										title={file.metadata?.fileName || "Unknown file"}
										subtitle={`From: ${formatAddress(file.senderAddress)}`}
										variant="info"
										actionButton={{
											label: acknowledgeFile.isPending
												? "Acknowledging..."
												: "Acknowledge",
											onClick: () => handleAcknowledgeFile(file.pieceCid),
											loading: acknowledgeFile.isPending,
											variant: "outline",
										}}
									/>
								))}
							</div>
						</div>
					)}

					{/* Empty State */}
					{notificationCount === 0 &&
						!(receivedRequests.isLoading || receivedFiles.isLoading) && (
							<div className="p-8 text-center">
								<CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
								<h4 className="text-sm font-medium mb-1">All caught up!</h4>
								<p className="text-xs text-muted-foreground">
									No pending actions at this time.
								</p>
							</div>
						)}
				</div>
			</PopoverContent>

			{/* Confirmation Dialog for Accepting Share Requests */}
			<AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Accept Sharing Request</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to accept this sharing request? This will
							allow the sender to share documents with you.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={() => {
								setConfirmDialogOpen(false);
								setPendingAcceptWallet(null);
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmAllowSharing}
							disabled={allowSharing.isPending}
						>
							{allowSharing.isPending ? "Accepting..." : "Accept Request"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Popover>
	);
}
