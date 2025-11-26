import {
	AlienIcon,
	ArrowDownIcon,
	AtomIcon,
	BuildingsIcon,
	CoinIcon,
	CubeIcon,
	DatabaseIcon,
	GlobeHemisphereWestIcon,
	HexagonIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Button } from "@/src/lib/components/ui/button";
import { cn } from "@/src/lib/utils";

const companies = [
	{ name: "Gitcoin", icon: CoinIcon },
	{ name: "Filecoin Foundation", icon: DatabaseIcon },
	{ name: "Hedera Hashgraph", icon: HexagonIcon },
	{ name: "Aragon", icon: GlobeHemisphereWestIcon },
	{ name: "Matter Labs", icon: AtomIcon },
	{ name: "Metaplex", icon: CubeIcon },
	{ name: "Towns", icon: BuildingsIcon },
	{ name: "Near", icon: AlienIcon },
];

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
	className?: string;
	reverse?: boolean;
	children?: React.ReactNode;
	vertical?: boolean;
	repeat?: number;
}

const Marquee = ({
	className,
	reverse,
	children,
	vertical = false,
	repeat = 4,
	...props
}: MarqueeProps) => {
	return (
		<div
			{...props}
			className={cn(
				"group flex overflow-hidden p-2 [--gap:4rem] [gap:var(--gap)]",
				{
					"flex-row": !vertical,
					"flex-col": vertical,
				},
				className,
			)}
		>
			{Array(repeat)
				.fill(0)
				.map((_, i) => (
					<motion.div
						// biome-ignore lint/suspicious/noArrayIndexKey: presentational
						key={i}
						className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
							"flex-row": !vertical,
							"flex-col": vertical,
						})}
						animate={{
							x: vertical
								? 0
								: reverse
									? ["calc(-100% - var(--gap))", "0%"]
									: ["0%", "calc(-100% - var(--gap))"],
							y: vertical
								? reverse
									? ["calc(-100% - var(--gap))", "0%"]
									: ["0%", "calc(-100% - var(--gap))"]
								: 0,
						}}
						transition={{
							duration: 30,
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
						}}
					>
						{children}
					</motion.div>
				))}
		</div>
	);
};

export default function PricingHero() {
	return (
		<section className="pt-32 pb-12 px-4 md:px-8 lg:px-page bg-background relative overflow-hidden">
			<div className="max-w-7xl mx-auto relative z-10 space-y-16">
				{/* Top Section: Text Left, Buttons Right */}
				<div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 lg:gap-12">
					{/* Text Content */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="max-w-3xl"
					>
						<h1 className="text-4xl md:text-5xl lg:text-5xl font-medium font-manrope tracking-tight text-foreground mb-6 leading-[1.1]">
							Secure signing for every scale.
							<br />
							Simple, transparent pricing.
						</h1>
						<p className="text-lg md:text-xl font-light font-manrope text-muted-foreground max-w-xl leading-relaxed">
							From individual creators to global enterprises,
							<br className="hidden md:block" />
							we have a plan that grows with you.
						</p>
					</motion.div>

					{/* Action Buttons */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="flex flex-wrap gap-4 shrink-0"
					>
						<Button variant="primary" size="lg" className="h-12 px-8 text-base">
							Start for free
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="h-12 px-8 text-base gap-2"
						>
							<ArrowDownIcon className="size-4" />
							Compare plans
						</Button>
					</motion.div>
				</div>

				{/* Bottom Section: Trusted Companies */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="pt-8 space-y-8"
				>
					<p className="text-muted-foreground text-sm font-medium font-manrope">
						Trusted by 100+ Web3 leaders
					</p>

					<div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background -ml-4 md:ml-0">
						<Marquee className="[--duration:60s]">
							{companies.map((company) => (
								<div
									key={company.name}
									className="flex items-center gap-3 text-muted-foreground/60 hover:text-foreground transition-colors px-8 grayscale hover:grayscale-0 duration-300"
								>
									<company.icon className="h-6 w-6" weight="fill" />
									<span className="text-xl font-manrope font-medium tracking-tight">
										{company.name}
									</span>
								</div>
							))}
						</Marquee>

						<div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background dark:from-background" />
						<div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background dark:from-background" />
					</div>
				</motion.div>
			</div>

			{/* Background Decorative Elements */}
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-50">
				<div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[120px]" />
			</div>
		</section>
	);
}
