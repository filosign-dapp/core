import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import Logo from "@/src/lib/components/custom/Logo";
import { Button } from "@/src/lib/components/ui/button";

interface HeaderProps {
	onSend: () => void;
}

export default function Header({ onSend }: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 glass bg-background/95 border-b border-border">
			<div className="flex items-center justify-between h-16 px-6">
				<div className="flex items-center gap-4">
					<Logo
						className="px-0"
						textClassName="text-foreground font-bold"
						iconOnly
					/>
					<h3>Add Signature</h3>
				</div>

				<Button variant="primary" onClick={onSend}>
					<PaperPlaneRightIcon className="size-4" weight="bold" />
					<p className="hidden sm:block">Send Envelope</p>
				</Button>
			</div>
		</header>
	);
}
