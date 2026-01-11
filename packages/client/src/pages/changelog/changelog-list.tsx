import { motion } from "motion/react";
import { Image } from "@/src/lib/components/custom/Image";
import { Badge } from "@/src/lib/components/ui/badge";

type ChangeType = "Feature" | "Enhancement" | "Fix";

type ChangelogEntry = {
	id: string;
	date: string;
	type: ChangeType;
	title: string;
	description: string[];
	image?: string;
};

const entries: ChangelogEntry[] = [
	{
		id: "1",
		date: "Jan 11, 2026",
		type: "Feature",
		title: "Post-quantum signature library",
		description: [
			"We've launched a comprehensive signature management system with support for multiple signature types: draw, type, or upload your own signature image.",
			"All signatures are now secured with Dilithium post-quantum cryptography and anchored to FVM smart contracts, ensuring long-term verifiability even as quantum computing advances.",
			"The signature library includes visual hash verification, allowing you to confirm document integrity at a glance before signing.",
		],
	},
	{
		id: "2",
		date: "Dec 20, 2025",
		type: "Enhancement",
		title: "Enhanced document sharing with permission system",
		description: [
			"Our secure document sharing now includes a comprehensive approval workflow. Senders must request permission before sharing documents, ensuring you have full control over who can send you files.",
			"The system uses ECDH key exchange for end-to-end encryption, guaranteeing that only approved recipients can decrypt shared documents.",
			"We've also added network discovery features, making it easy to see who you can send to and who can send to you based on mutual approvals.",
		],
	},
	{
		id: "3",
		date: "Nov 28, 2025",
		type: "Feature",
		title: "User profiles with decentralized identity",
		description: [
			"Introducing user profiles with unique usernames, display names, avatars, and rich metadata. Your profile is stored off-chain for privacy while maintaining decentralized identity principles.",
			"Profile information makes it easier to identify collaborators in your document network, with real-time username availability checking and profile existence validation.",
			"All profile data integrates seamlessly with our existing document sharing and acknowledgment system.",
		],
	},
	{
		id: "4",
		date: "Nov 12, 2025",
		type: "Enhancement",
		title: "Filecoin storage migration and optimization",
		description: [
			"Documents now automatically migrate from temporary S3 storage to permanent Filecoin storage via FilCDN, ensuring long-term availability and immutability.",
			"We've optimized the storage pipeline to reduce upload times while maintaining end-to-end encryption throughout the process.",
			"All documents are now content-addressed using IPFS CIDs, making them verifiable and accessible through any IPFS gateway.",
		],
	},
	{
		id: "5",
		date: "Oct 25, 2025",
		type: "Fix",
		title: "Dual-factor authentication improvements",
		description: [
			"Enhanced the PIN + wallet signature authentication flow with improved error handling and clearer feedback during the registration and login process.",
			"Fixed an issue where Argon2id PIN hashing could timeout on slower devices. We've optimized the memory-hard function parameters for better performance across all devices.",
			"Improved the master seed derivation process, ensuring consistent key generation across sessions.",
		],
	},
	{
		id: "6",
		date: "Oct 8, 2025",
		type: "Feature",
		title: "React SDK with IndexedDB caching",
		description: [
			"Launched our comprehensive React SDK with type-safe hooks, automatic IndexedDB caching, and seamless integration with the FilosignProvider.",
			"The SDK now includes automatic cache invalidation, offline support for cached data, and comprehensive error handling with detailed error types.",
			"Developers can now build Filosign-powered applications with full TypeScript support and React Query integration for optimal performance.",
		],
	},
];

export default function ChangelogList() {
	return (
		<section className="py-20 px-4 md:px-8 lg:px-page bg-background">
			<div className="max-w-5xl mx-auto space-y-24">
				{entries.map((entry, index) => (
					<motion.div
						key={entry.id}
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						className="grid md:grid-cols-[200px_1fr] gap-8"
					>
						{/* Date Column */}
						<div className="text-muted-foreground font-medium text-sm md:text-right pt-1 font-manrope">
							{entry.date}
						</div>

						{/* Content Column */}
						<div className="space-y-6">
							<div className="flex items-center gap-2">
								<Badge
									variant="secondary"
									className="bg-muted/50 text-muted-foreground hover:bg-muted/60 font-normal px-2.5 py-0.5 h-auto"
								>
									<span
										className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
											entry.type === "Feature"
												? "bg-blue-400"
												: entry.type === "Enhancement"
													? "bg-purple-400"
													: "bg-orange-400"
										}`}
									/>
									{entry.type}
								</Badge>
							</div>

							<div className="space-y-4">
								<h2 className="text-3xl font-medium font-manrope tracking-tight text-foreground">
									{entry.title}
								</h2>
								<div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
									{entry.description.map((paragraph, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: static content
										<p key={i}>{paragraph}</p>
									))}
								</div>
							</div>

							{entry.image && (
								<div className="relative rounded-3xl overflow-hidden w-full aspect-[16/10] bg-muted mt-8">
									<Image
										src={entry.image}
										alt={entry.title}
										width={800}
										height={500}
										className="absolute inset-0 w-full h-full object-cover"
									/>
									{/* Optional overlay content if needed, similar to the example's chart overlay */}
									<div className="absolute bottom-8 left-8 bg-background/95 backdrop-blur p-6 rounded-2xl shadow-sm max-w-xs border border-border/50 hidden md:block">
										<div className="text-sm font-medium text-muted-foreground mb-1">
											Documents signed
										</div>
										<div className="text-2xl font-semibold font-manrope flex items-center gap-2">
											1,240
											<span className="text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
												+14.2%
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</motion.div>
				))}
			</div>
		</section>
	);
}
