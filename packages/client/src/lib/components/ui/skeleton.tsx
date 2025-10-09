import { cn } from "../../utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn("bg-muted/20 animate-pulse rounded-lg", className)}
			{...props}
		/>
	);
}

export { Skeleton };
