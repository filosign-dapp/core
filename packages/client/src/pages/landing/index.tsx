import { Badge } from "@/src/lib/components/ui/badge";
import LandingNavbar from "./landing-nav";
import { Button } from "@/src/lib/components/ui/button";
import { StarIcon, ArrowRightIcon, PlayIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Image } from "@/src/lib/components/custom/Image";

export default function LandingPage() {
  return (
    <div className="p-page [--section-gap:4rem]">
      {/* Navbar */}
      <section className="sticky top-10 z-50">
        <LandingNavbar />
      </section>

      <div className="h-[var(--section-gap)]" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto flex flex-col gap-8 py-8">
        <div className="flex flex-col gap-4">
          {/* Announcement Banner */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.2
            }}
            className="self-start"
          >
            <Badge>
              Join our waitlist <ArrowRightIcon className="size-4" />
            </Badge>
          </motion.button>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.4
            }}
            className="md:text-5xl"
          >
            Trustless document signing for the modern web.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.6
            }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed -mt-2"
          >
            Secure, fast, and easy-to-use document signing on filecoin.
          </motion.p>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 1.0
            }}
            className="flex flex-row items-center gap-4"
          >
            <Button variant="primary" size="lg" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                Get started
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </Button>

            <Button variant="secondary" size="lg" asChild>
              <Link to="/dashboard" className="flex items-center gap-2 text-foreground">
                <PlayIcon className="w-4 h-4" />
                See it in action
              </Link>
            </Button>
          </motion.div>
        </div>

        <Image src="/static/hero.png" alt="Filosign" width={500} height={500} className="size-full rounded-main" />
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto h-screen flex flex-col gap-8 py-8">
        <h1 className="font-semibold">Features</h1>
      </section>

      <section className="max-w-6xl mx-auto h-screen flex flex-col gap-8 py-8">
        <h1 className="font-semibold">Pricing</h1>
      </section>
    </div>
  );
}