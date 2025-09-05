import { motion } from "motion/react";
import { LightningIcon } from "@phosphor-icons/react";
import { cn } from "../../utils";
import { useSidebar } from "../ui/sidebar";

interface LogoProps {
    iconClassName?: string;
    textClassName?: string;
    animatedLogo?: boolean;
    iconOnly?: boolean;
}

export default function Logo({ iconClassName, textClassName, animatedLogo = true, iconOnly = false }: LogoProps) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    
    return (
        <motion.div
            className="flex items-center group/logo cursor-pointer"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
                type: "spring",
                stiffness: 230,
                damping: 25,
                delay: 0.17
            }}
        >
            <motion.div
                className="p-2 mr-3 rounded-xl bg-primary transition-colors duration-200"
                initial={animatedLogo ? { scale: 0, rotate: -180 } : {}}
                animate={animatedLogo ? { scale: 1, rotate: 0 } : {}}
                transition={{
                    type: "spring",
                    stiffness: 345,
                    damping: 20,
                    delay: 0.26
                }}
            >
                <LightningIcon
                    className={cn(
                        `size-6 text-foreground transition-all duration-200`,
                        animatedLogo ? `group-hover/logo:rotate-12 group-hover/logo:scale-105` : "",
                        iconClassName
                    )}
                />
            </motion.div>
            {!iconOnly && !isCollapsed && (
                <motion.h3
                    className={cn(
                        "text-primary font-manrope transition-colors duration-200",
                        textClassName
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 230,
                        damping: 25,
                        delay: 0.35
                    }}
                >
                    filosign
                </motion.h3>
            )}
        </motion.div>
    )
}