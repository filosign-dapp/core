import { motion } from "motion/react";
import { Image } from "@/src/lib/components/custom/Image";
import MarkdownRenderer from "@/src/lib/components/custom/MarkdownRenderer";
import FooterSection from "../landing/footer-section";
import LandingNavbar from "../landing/landing-nav";
import { blogPost } from "./mock";

export default function BlogPostPage() {
	// In a real app, we would fetch the post based on the ID
	// const { postId } = useParams({ from: '/blog/$postId' })
	const post = blogPost;

	return (
		<div className="min-h-screen bg-background font-manrope selection:bg-primary/10 selection:text-primary">
			<LandingNavbar />

			<main className="pt-32 pb-20">
				{/* Header & Hero Container - Wider width */}
				<div className="lg:max-w-[80dvw] mx-auto px-8 md:px-page mb-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-24 mb-20 items-start"
					>
						{/* Left Column: Title & Meta */}
						<div className="lg:col-span-7 space-y-8">
							<div className="flex items-center gap-2">
								<span className="bg-secondary/50 text-foreground px-3 py-1 rounded-full text-xs font-normal tracking-wide">
									Reading time: {post.readingTime}
								</span>
							</div>

							<h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground leading-[1.05] font-manrope">
								{post.title}
							</h1>
						</div>

						{/* Right Column: Quote & Author */}
						<div className="lg:col-span-5 space-y-10 lg:pt-4 lg:pl-8">
							{post.quote && (
								<p className="text-md md:text-lg font-manrope text-muted-foreground/80 leading-relaxed">
									{post.quote}
								</p>
							)}

							<div className="flex items-center gap-4">
								<div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
									<Image
										src={post.author.avatar}
										alt={post.author.name}
										width={48}
										height={48}
										className="object-cover w-full h-full"
									/>
								</div>
								<div className="flex flex-col gap-0.5">
									<span className="text-sm text-muted-foreground">
										{post.author.role}
									</span>
									<span className="font-medium text-foreground">
										{post.author.name}
									</span>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Hero Image */}
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="rounded-[2rem] overflow-hidden shadow-sm"
					>
						<Image
							src={post.heroImage}
							alt={post.title}
							width={1400}
							height={800}
							className="w-full h-auto object-cover aspect-[16/9] lg:aspect-[2/1]"
						/>
					</motion.div>
				</div>

				{/* Article Content Container - Narrower width */}
				<article className="max-w-5xl mx-auto px-8 md:px-page">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
					>
						<MarkdownRenderer content={post.content} />
					</motion.div>
				</article>
			</main>

			<FooterSection />
		</div>
	);
}
