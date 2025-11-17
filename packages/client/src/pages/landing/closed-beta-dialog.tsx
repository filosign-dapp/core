import { LockIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Button } from "@/src/lib/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/src/lib/components/ui/dialog";

interface ClosedBetaDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function ClosedBetaDialog({
	open,
	onOpenChange,
}: ClosedBetaDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 20,
						}}
						className="flex justify-center items-center mx-auto mb-4 rounded-full border size-16 bg-primary"
					>
						<LockIcon
							className="size-8 text-primary-foreground"
							weight="bold"
						/>
					</motion.div>
					<DialogTitle className="text-center text-2xl sm:text-3xl font-semibold leading-tight">
						App is in Closed Beta
					</DialogTitle>
					<DialogDescription className="text-center text-base sm:text-lg text-muted-foreground leading-relaxed mt-2">
						We're currently in closed beta and working hard to make Filosign
						perfect for you. We'll notify you as soon as we're ready for public
						beta.
					</DialogDescription>
				</DialogHeader>

				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 25,
						delay: 0.2,
					}}
					className="flex flex-col gap-3 mt-6"
				>
					<Button
						variant="primary"
						size="lg"
						onClick={() => onOpenChange(false)}
						className="w-full"
					>
						Got it
					</Button>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
