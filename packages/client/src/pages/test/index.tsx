import { useFilosignQuery } from "@filosign/react";
import {
	ClockIcon,
	EyeIcon,
	FileIcon,
	KeyIcon,
	PaperPlaneIcon,
	SignatureIcon,
	UserCheckIcon,
	UserIcon,
	WalletIcon,
} from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";
import { useBalance, useWalletClient } from "wagmi";
import { Badge } from "../../lib/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../lib/components/ui/card";
import { Separator } from "../../lib/components/ui/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../../lib/components/ui/tabs";
import { AuthenticationTest } from "./_components/AuthenticationTest";
import { FileTest } from "./_components/FileTest";
import { ProfileTest } from "./_components/ProfileTest";
import { ShareReceiverTest } from "./_components/ShareReceiverTest";
import { ShareSenderTest } from "./_components/ShareSenderTest";
import { SignatureTest } from "./_components/SignatureTest";
import { StatusBadge } from "./_components/StatusBadge";

export default function TestPage() {
	const { user } = usePrivy();
	const { data: walletClient } = useWalletClient();

	const { data: balance } = useBalance({
		address: walletClient?.account.address,
	});

	const isRegistered = useFilosignQuery(["isRegistered"], undefined);
	const isLoggedIn = useFilosignQuery(["isLoggedIn"], undefined);

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">
						Filosign Test Suite
					</h1>
					<p className="text-muted-foreground">
						Comprehensive testing interface for Filosign functionality
					</p>
				</div>

				{/* Status Overview */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<EyeIcon className="w-5 h-5" />
							System Status
						</CardTitle>
						<CardDescription>
							Current authentication and system state
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Privy User</span>
								<StatusBadge
									status={!!user}
									label={user ? "Connected" : "Disconnected"}
								/>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Wallet Client</span>
								<StatusBadge
									status={!!walletClient}
									label={walletClient ? "Available" : "Unavailable"}
								/>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Filosign Registered</span>
								{isRegistered.data === undefined ? (
									<Badge variant="outline">
										<ClockIcon className="w-3 h-3 mr-1" />
										Loading
									</Badge>
								) : (
									<StatusBadge
										status={isRegistered.data as boolean}
										label={isRegistered.data ? "Yes" : "No"}
									/>
								)}
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Filosign Logged In</span>
								{isLoggedIn.data === undefined ? (
									<Badge variant="outline">
										<ClockIcon className="w-3 h-3 mr-1" />
										Loading
									</Badge>
								) : (
									<StatusBadge
										status={isLoggedIn.data as boolean}
										label={isLoggedIn.data ? "Yes" : "No"}
									/>
								)}
							</div>
						</div>

						{user && (
							<>
								<Separator />
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<UserIcon className="w-4 h-4 text-muted-foreground" />
										<span className="text-sm font-medium">Wallet Address:</span>
										<code className="text-xs bg-muted px-2 py-1 rounded">
											{user.wallet?.address}
										</code>
									</div>
									{balance && (
										<div className="flex items-center gap-2">
											<WalletIcon className="w-4 h-4 text-muted-foreground" />
											<span className="text-sm font-medium">Balance:</span>
											<Badge variant="outline">
												{formatEther(balance.value)} tFIL
											</Badge>
										</div>
									)}
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Main Test Interface */}
				<Tabs defaultValue="auth" className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
						<TabsTrigger value="auth" className="flex items-center gap-2">
							<KeyIcon className="w-4 h-4" />
							Auth
						</TabsTrigger>
						<TabsTrigger
							value="share-sender"
							className="flex items-center gap-2"
						>
							<PaperPlaneIcon className="w-4 h-4" />
							Send
						</TabsTrigger>
						<TabsTrigger
							value="share-receiver"
							className="flex items-center gap-2"
						>
							<UserCheckIcon className="w-4 h-4" />
							Receive
						</TabsTrigger>
						<TabsTrigger value="files" className="flex items-center gap-2">
							<FileIcon className="w-4 h-4" />
							Files
						</TabsTrigger>
						<TabsTrigger value="profile" className="flex items-center gap-2">
							<UserIcon className="w-4 h-4" />
							Profile
						</TabsTrigger>
						<TabsTrigger value="signatures" className="flex items-center gap-2">
							<SignatureIcon className="w-4 h-4" />
							Signatures
						</TabsTrigger>
					</TabsList>

					{/* Authentication Tab */}
					<TabsContent value="auth" className="space-y-6">
						<AuthenticationTest />
					</TabsContent>

					{/* Share Sender Tab */}
					<TabsContent value="share-sender" className="space-y-6">
						<ShareSenderTest />
					</TabsContent>

					{/* Share Receiver Tab */}
					<TabsContent value="share-receiver" className="space-y-6">
						<ShareReceiverTest />
					</TabsContent>

					{/* Files Tab */}
					<TabsContent value="files" className="space-y-6">
						<FileTest />
					</TabsContent>

					{/* Profile Tab */}
					<TabsContent value="profile" className="space-y-6">
						<ProfileTest />
					</TabsContent>

					{/* Signatures Tab */}
					<TabsContent value="signatures" className="space-y-6">
						<SignatureTest />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
