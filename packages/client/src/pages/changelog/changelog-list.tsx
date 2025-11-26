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
		date: "Feb 3, 2025",
		type: "Feature",
		title: "Multi-chain wallet support",
		description: [
			"We've expanded our wallet support beyond Ethereum. You can now connect and sign documents using Solana, Polygon, and Near wallets.",
			"This update includes seamless network switching and automatic chain detection, making it easier than ever to use your preferred identity across the Web3 ecosystem.",
		],
	},
	{
		id: "2",
		date: "Feb 3, 2025",
		type: "Enhancement",
		title: "Smart contract verification",
		description: [
			"Our document verification engine is now directly integrated with on-chain smart contracts.",
			"This allows for automated execution of agreement terms once all parties have signed. Perfect for DAOs and automated treasury management.",
			"We've also added a new 'Verify' badge to documents that have been successfully anchored to the Filecoin network.",
		],
		image: "/static/images/stock_4.webp",
	},
	{
		id: "3",
		date: "Jan 28, 2025",
		type: "Fix",
		title: "Ledger connection stability",
		description: [
			"Fixed an intermittent timeout issue when connecting Ledger devices via Bluetooth on mobile browsers.",
			"Improved transaction feedback when signing large PDF files with hardware wallets.",
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
											Contracts signed
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
