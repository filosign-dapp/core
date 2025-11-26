import { motion } from "motion/react";
import { Image } from "@/src/lib/components/custom/Image";

export default function TestimonialSection() {
	return (
		<section className="py-24 px-8 md:px-page max-w-4xl mx-auto text-center">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="space-y-12"
			>
				<blockquote className="text-xl md:text-3xl font-medium leading-tight tracking-tight font-manrope text-foreground">
					"Moving our contract workflow to Filosign was seamless. It’s faster
					than our previous tool, and the decentralized storage gives us 100%
					confidence that our records are permanent and truly under our
					control."
				</blockquote>

				<div className="flex items-center justify-center gap-4">
					<div className="relative size-14 rounded-full overflow-hidden bg-secondary">
						<Image
							src="https://media.licdn.com/dms/image/v2/D4D03AQH6htP4udwpVw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1705944572806?e=1766016000&v=beta&t=2hO5wL4zgsvEiDUk7nAqWbidFGLeZJpxwlzpkUvRLWg"
							alt="Ken"
							width={64}
							height={64}
							className="object-cover w-full h-full"
						/>
					</div>
					<div className="text-left">
						<div className="font-semibold text-lg font-manrope">Ken</div>
						<div className="text-muted-foreground text-sm font-manrope">
							Founder & CEO @Toku
						</div>
					</div>
				</div>
			</motion.div>
		</section>
	);
}
