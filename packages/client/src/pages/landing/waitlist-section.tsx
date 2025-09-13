import { Button } from "@/src/lib/components/ui/button";
import { PaperPlaneTiltIcon, CheckIcon, SpinnerBallIcon, RocketLaunchIcon } from "@phosphor-icons/react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useState, useRef } from "react";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for scroll-triggered animations
  const waitlistRef = useRef(null);
  const waitlistInView = useInView(waitlistRef, { once: true, margin: "-100px" });

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <section ref={waitlistRef} className="max-w-[90dvw] md:max-w-[70dvw] mx-auto min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-page">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="waitlist-form"
            initial={{ opacity: 0, y: 50 }}
            animate={waitlistInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: 0.2
            }}
            className="w-full flex flex-col gap-8"
          >
            {/* Funky Rocket Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={waitlistInView ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.5, rotate: -180 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2
              }}
              className="flex justify-center"
            >
              <div className="relative">
                {/* Main rocket container */}
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border-2 border-primary/30 flex items-center justify-center relative overflow-hidden"
                >
                  {/* Rocket icon */}
                  <RocketLaunchIcon 
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 text-primary drop-shadow-lg" 
                    weight="fill" 
                  />
                  
                  {/* Sparkle effects */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-yellow-400 rounded-full absolute top-4 left-8 animate-pulse" />
                    <div className="w-1 h-1 bg-blue-400 rounded-full absolute top-8 right-6 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full absolute bottom-6 left-6 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="w-1 h-1 bg-green-400 rounded-full absolute bottom-8 right-8 animate-pulse" style={{ animationDelay: '1.5s' }} />
                  </motion.div>
                </motion.div>

                {/* Exhaust trail */}
                <motion.div
                  animate={{ 
                    scaleY: [1, 1.3, 1],
                    opacity: [0.6, 0.8, 0.6]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-16 bg-gradient-to-t from-orange-500/60 via-yellow-400/40 to-transparent rounded-full blur-sm"
                />

                {/* Glow effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 blur-2xl"
                />

                {/* Orbiting particles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 w-1 h-1 bg-primary/60 rounded-full transform -translate-x-1/2 -translate-y-2" />
                  <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-primary/60 rounded-full transform -translate-x-1/2 translate-y-2" />
                  <div className="absolute left-0 top-1/2 w-1 h-1 bg-primary/60 rounded-full transform -translate-y-1/2 -translate-x-2" />
                  <div className="absolute right-0 top-1/2 w-1 h-1 bg-primary/60 rounded-full transform -translate-y-1/2 translate-x-2" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={waitlistInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.3
              }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-9xl font-semibold leading-tight">
                Join the waitlist
              </h1>
              <p className="text-base sm:text-lg xl:text-lg text-muted-foreground leading-relaxed mx-auto mt-4">
                Be the first one to try Filosign when it goes live on the mainnet.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleJoinWaitlist}
              className="w-full max-w-7xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={waitlistInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.4
              }}
            >
              <div className="flex gap-3 sm:gap-4 w-full flex-col md:flex-row">
                <input
                  type="email"
                  placeholder="enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-base sm:text-lg md:text-2xl lg:text-4xl p-3 sm:p-4 md:p-5 rounded-large border-2 focus-visible:border-primary focus-visible:ring-primary/20 bg-background/50 backdrop-blur-sm"
                  required
                />

                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="w-full md:w-auto"
                >
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!email}
                    className="h-12 sm:h-16 md:h-20 px-4 sm:px-6 md:px-8 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold rounded-large group relative overflow-hidden w-full md:w-auto min-w-[120px] sm:min-w-[140px] md:min-w-[160px]"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2 sm:gap-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="spinner"
                            initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                            transition={{ 
                              duration: 0.3, 
                              ease: "easeInOut" 
                            }}
                            className="flex items-center justify-center"
                          >
                            <SpinnerBallIcon className="size-5 sm:size-6 md:size-8 lg:size-10 animate-spin" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="send-icon"
                            initial={{ opacity: 0, scale: 0.8, rotate: 180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                            transition={{ 
                              duration: 0.3, 
                              ease: "easeInOut" 
                            }}
                            className="flex items-center justify-center"
                          >
                            <PaperPlaneTiltIcon className="size-5 sm:size-6 md:size-8 lg:size-10 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 group-active:translate-x-0 group-active:translate-y-0" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Animated background effect */}
                    <motion.div
                      className="absolute inset-0 bg-primary-foreground/10"
                      initial={{ scaleX: 0, originX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </Button>
                </motion.div>
              </div>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="success-message"
            initial={{
              y: 100,
              opacity: 0,
            }}
            animate={waitlistInView ? {
              y: 0,
              opacity: 1,
            } : {
              y: 100,
              opacity: 0,
            }}
            exit={{
              y: -100,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              duration: 0.8
            }}
            className="text-center space-y-6 p-8 rounded-large"
          >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={waitlistInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: 0.4
            }}
            className="size-20 sm:size-24 md:size-28 lg:size-32 mx-auto rounded-full bg-primary border flex items-center justify-center"
          >
            <CheckIcon className="size-12 sm:size-16 md:size-18 lg:size-20 text-primary-foreground" weight="bold" />
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={waitlistInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: 0.5
            }}
            className="space-y-2"
          >
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={waitlistInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.5
              }} className="text-2xl sm:text-3xl md:text-4xl xl:text-7xl leading-tight">You're on the list!</motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={waitlistInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.6
              }} className="text-base sm:text-lg xl:text-lg text-muted-foreground leading-relaxed">
              We'll notify you as soon as we go live on the mainnet.
            </motion.p>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
