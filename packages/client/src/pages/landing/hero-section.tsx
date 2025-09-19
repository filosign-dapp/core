import { Badge } from "@/src/lib/components/ui/badge";
import { Button } from "@/src/lib/components/ui/button";
import { CaretRightIcon, CircleIcon, PlayIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Image } from "@/src/lib/components/custom/Image";

export default function HeroSection() {
  return (
    <section className="sm:max-w-[80dvw] mx-auto flex flex-col gap-6 md:gap-8 py-12 p-8 md:p-page">
      {/* Text Content Group */}
      <motion.div
        className="flex flex-col gap-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          delay: 0.8
        }}
      >
        {/* Announcement Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            delay: 1.3
          }}
          className="self-start group"
        >
          <Badge>
            <CircleIcon className="size-4 animate-pulse" weight="fill" /> Waitlist is live
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            delay: 1.4
          }}
          className="text-3xl sm:text-4xl md:text-5xl xl:text-7xl leading-tight"
        >
          Trustless document signing for the modern web.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            delay: 1.5
          }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed -mt-2"
        >
          Secure, fast, and easy-to-use document signing on filecoin.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            delay: 1.6
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
        >
          <Button variant="primary" size="lg" asChild className="w-full sm:w-auto">
            <Link to="/dashboard" className="flex items-center justify-center gap-2 group">
              Get started
              <CaretRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
            <Link to="/dashboard" className="flex items-center justify-center gap-2 text-foreground group">
              <PlayIcon className="w-4 h-4 transition-transform duration-200 group-hover:rotate-120" />
              See it in action
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
          delay: 1.5
        }}
        className="flex items-center justify-center bg-secondary p-4 md:p-6 rounded-3xl mt-4"
      >
        <Image src="/static/hero_2.png" alt="Filosign" width={500} height={500} className="size-full rounded-large" />
      </motion.div>
    </section>
  );
}
