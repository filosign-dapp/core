import { LightningIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";

interface LogoProps {
	className?: string;
	iconClassName?: string;
	textClassName?: string;
	animatedLogo?: boolean;
	iconOnly?: boolean;
	isCollapsed?: boolean;
	onIconClick?: () => void;
	showText?: boolean;
	textDelay?: number;
	iconDelay?: number;
}

export default function LogoPage({
	className,
	iconClassName,
	textClassName,
	animatedLogo = true,
	iconOnly = false,
	isCollapsed = false,
	onIconClick,
	showText = true,
	textDelay = 2.1,
	iconDelay = 2.26,
}: LogoProps) {
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsExiting(true);
			// Wait for exit animation to complete before calling callback
			setTimeout(() => {
				onIconClick?.();
			}, 600); // Adjust timing based on animation duration
		}, 2000); // Trigger exit after 2 seconds

		return () => clearTimeout(timer);
	}, [onIconClick]);

	const iconVariants = {
		hidden: {
			scale: 0,
			rotate: -180,
			transition: {
				type: "spring" as const,
				stiffness: 345,
				damping: 20,
				delay: iconDelay,
			},
		},
		visible: {
			scale: 1,
			rotate: 0,
			transition: {
				type: "spring" as const,
				stiffness: 345,
				damping: 20,
			},
		},
		exit: {
			scale: 0,
			rotate: 180,
			opacity: 0,
			transition: {
				type: "spring" as const,
				stiffness: 200,
				damping: 30,
				mass: 0.8,
				delay: 0,
			},
		},
	};

	const textVariants = {
		hidden: {
			opacity: 0,
			x: -20,
			transition: {
				type: "spring" as const,
				stiffness: 230,
				damping: 25,
				delay: textDelay,
			},
		},
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				type: "spring" as const,
				stiffness: 230,
				damping: 25,
			},
		},
		exit: {
			opacity: 0,
			x: 60,
			transition: {
				type: "spring" as const,
				stiffness: 150,
				damping: 25,
				mass: 1,
				delay: 0,
			},
		},
	};

	return (
		<div className="flex justify-center items-center min-h-screen">
			<AnimatePresence mode="wait">
				{!isExiting && (
					<motion.button
						key="logo"
						className={cn(
							"flex items-center group/logo py-2 cursor-pointer transition-all",
							!isCollapsed && "px-4 -ml-1",
							className,
						)}
						initial="hidden"
						animate="visible"
						exit="exit"
					>
						<motion.div
							className={cn(
								"p-2 rounded-4xl bg-secondary transition-colors duration-200 ml-1",
							)}
							variants={animatedLogo ? iconVariants : undefined}
							initial={animatedLogo ? "hidden" : undefined}
							animate={animatedLogo ? "visible" : undefined}
							exit={animatedLogo ? "exit" : undefined}
						>
							<LightningIcon
								className={cn(
									`size-64 text-foreground transition-all duration-200`,
									animatedLogo
										? `group-hover/logo:rotate-12 group-hover/logo:scale-105`
										: "",
									iconClassName,
								)}
								weight="fill"
							/>
						</motion.div>
						{!iconOnly && !isCollapsed && showText && (
							<motion.h3
								className={cn(
									"text-foreground ml-12 font-manrope text-[200px] transition-colors duration-200",
									textClassName,
								)}
								variants={textVariants}
								initial="hidden"
								animate="visible"
								exit="exit"
							>
								filosign
							</motion.h3>
						)}
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	);
}
