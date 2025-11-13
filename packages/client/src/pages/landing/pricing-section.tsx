import { Buildings, CheckCircle, Cloud } from "@phosphor-icons/react";
import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { Badge } from "@/src/lib/components/ui/badge";
import { Button } from "@/src/lib/components/ui/button";
import { Switch } from "@/src/lib/components/ui/switch";

const plans = [
	{
		name: "Trial",
		price: 0,
		priceSuffix: "",
		description:
			"Try out Filosign on the filecoin calibration testnet. Get a feel for trustless signing.",
		features: [
			"Files are stored temporarily for 7 days",
			"Share upto 5 files",
			"Access all the platform features",
			"No ",
		],
		buttonText: "Start for Free",
	},
	{
		name: "Standard",
		price: 25,
		priceSuffix: "per/month",
		billedYearly: {
			price: 20,
			save: 5 * 12,
		},
		description:
			"For professionals and freelancers who need unlimited, secure signing.",
		features: [
			"Everything in Hobby",
			"Unlimited documents",
			"Personal API Access",
			"Priority Email Support",
			"Custom Branding",
		],
		buttonText: "Get Started",
	},
	{
		name: "Enterprise",
		price: "50",
		priceSuffix: "per user, per month",
		billedYearly: {
			price: 40,
			save: 10 * 12,
		},
		description:
			"For professionals and freelancers who need unlimited, secure signing.",
		features: [
			"Everything in Hobby",
			"Unlimited documents",
			"Personal API Access",
			"Priority Email Support",
			"Custom Branding",
		],
		buttonText: "Get Started",
	},
];

export default function PricingSection() {
	const [billedYearly, setBilledYearly] = useState(false);
	const sectionRef = useRef(null);
	const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

	return (
		<section
			ref={sectionRef}
			className="lg:max-w-[80dvw] mx-auto flex flex-col gap-6 md:gap-8 py-8 md:py-12 p-8 md:p-page"
		>
			<motion.div
				className="text-center"
				initial={{ opacity: 0, y: 30 }}
				animate={isInView ? { opacity: 1, y: 0 } : {}}
				transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.2 }}
			>
				<h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl leading-tight">
					Pricing Plans for Every Need
				</h1>
				<p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mt-2">
					Experience the future of document signing. Secure, decentralized, and
					built for the modern web.
				</p>
			</motion.div>

			<motion.div
				className="flex items-center justify-center gap-4 my-6 md:my-8"
				initial={{ opacity: 0, y: 30 }}
				animate={isInView ? { opacity: 1, y: 0 } : {}}
				transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
			>
				<div className="relative flex w-48 sm:w-52 items-center rounded-full bg-primary p-2">
					<motion.div
						className="absolute left-1 top-1 h-[calc(100%-0.5rem)] w-[calc(50%-0.25rem)] rounded-full bg-background shadow-sm"
						animate={{ x: billedYearly ? "100%" : "0%" }}
						transition={{ type: "spring", duration: 0.2 }}
					/>
					<button
						onClick={() => setBilledYearly(false)}
						className={`relative z-10 flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors ${
							!billedYearly ? "text-foreground" : "text-background"
						}`}
					>
						Monthly
					</button>
					<button
						onClick={() => setBilledYearly(true)}
						className={`relative z-10 flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors ${
							billedYearly ? "text-foreground" : "text-background"
						}`}
					>
						Yearly
					</button>
				</div>
			</motion.div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 xl:gap-8">
				{plans.map((plan, index) => (
					<motion.div
						key={plan.name}
						className="flex flex-col p-4 sm:p-6 bg-card border rounded-large"
						initial={{ opacity: 0, y: 50 }}
						animate={isInView ? { opacity: 1, y: 0 } : {}}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 25,
							delay: 0.4 + index * 0.1,
						}}
					>
						<div className="flex-grow">
							<h2 className="text-xl sm:text-2xl font-semibold">{plan.name}</h2>
							<div className="flex items-baseline gap-2 mt-3 sm:mt-4">
								<span className="text-3xl sm:text-4xl font-bold">
									$
									{billedYearly && plan.billedYearly
										? plan.billedYearly.price
										: plan.price}
								</span>
								<span className="text-sm sm:text-base text-muted-foreground">
									{plan.priceSuffix}
								</span>
							</div>
							{plan.billedYearly && (
								<Badge variant="secondary" className="mt-2">
									Save ${plan.billedYearly.save} with yearly
								</Badge>
							)}
							<p className="text-sm sm:text-base text-muted-foreground mt-3 sm:mt-4">
								{plan.description}
							</p>
							<ul className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
								{plan.features.map((feature) => (
									<li key={feature} className="flex items-start gap-2 sm:gap-3">
										<CheckCircle
											className="text-ring flex-shrink-0 mt-0.5"
											size={16}
											weight="fill"
										/>
										<span className="text-sm sm:text-base">{feature}</span>
									</li>
								))}
							</ul>
						</div>
						<Button
							variant="primary"
							className="w-full mt-4 sm:mt-6 text-sm sm:text-base"
						>
							{plan.buttonText}
						</Button>
					</motion.div>
				))}
			</div>
		</section>
	);
}
