import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../utils";

function Collapsible({
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
	return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
	return (
		<CollapsiblePrimitive.CollapsibleTrigger
			data-slot="collapsible-trigger"
			{...props}
		/>
	);
}

function CollapsibleContent({
	className,
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
	return (
		<CollapsiblePrimitive.CollapsibleContent
			data-slot="collapsible-content"
			className={cn(
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1 transition-all duration-200",
				className,
			)}
			{...props}
		/>
	);
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
