import { motion } from "motion/react";
import { LightningIcon } from "@phosphor-icons/react";
import { cn } from "../../utils";
import { useNavigate } from "@tanstack/react-router";

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

export default function Logo({
  className,
  iconClassName,
  textClassName,
  animatedLogo = true,
  iconOnly = false,
  isCollapsed = false,
  onIconClick,
  showText = true,
  textDelay = 0.1,
  iconDelay = 0.26,
}: LogoProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      className={cn(
        "flex items-center group/logo py-2 cursor-pointer transition-all",
        !isCollapsed && "px-4 -ml-1",
        className,
      )}
      onClick={() => {
        onIconClick?.();
        navigate({ to: "/dashboard", replace: true });
      }}
    >
      <motion.div
        className={cn(
          "p-2 rounded-xl bg-secondary transition-colors duration-200 ml-1",
        )}
        initial={animatedLogo ? { scale: 0, rotate: -180 } : {}}
        animate={animatedLogo ? { scale: 1, rotate: 0 } : {}}
        transition={{
          type: "spring",
          stiffness: 345,
          damping: 20,
          delay: iconDelay,
        }}
      >
        <LightningIcon
          className={cn(
            `size-6 text-foreground transition-all duration-200`,
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
            "text-secondary ml-3 font-manrope transition-colors duration-200",
            textClassName,
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 230,
            damping: 25,
            delay: textDelay,
          }}
        >
          filosign
        </motion.h3>
      )}
    </motion.button>
  );
}
