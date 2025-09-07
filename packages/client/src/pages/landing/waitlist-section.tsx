import { Button } from "@/src/lib/components/ui/button";
import { PaperPlaneTiltIcon, CheckIcon, SpinnerBallIcon } from "@phosphor-icons/react";
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
    <section ref={waitlistRef} className="max-w-6xl mx-auto h-screen flex items-center justify-center p-page">
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
              <h1 className="text-7xl font-semibold leading-tight">
                Join the waitlist
              </h1>
              <p className="text-lg text-muted leading-relaxed max-w-2xl mx-auto">
                Be the first one to try Filosign when it goes live on the mainnet.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleJoinWaitlist}
              className="w-full max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={waitlistInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.4
              }}
            >
              <div className="flex gap-4 w-full flex-col md:flex-row">
                <input
                  type="email"
                  placeholder="enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-lg md:text-4xl p-4 rounded-large border-2 focus-visible:border-primary focus-visible:ring-primary/20"
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
                    className="h-20 px-8 text-2xl font-semibold rounded-large group relative overflow-hidden w-full md:w-auto"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="spinner"
                            initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ 
                              duration: 0.3, 
                              ease: "linear" 
                            }}
                            className="size-12 animate-spin"
                          >
                            <motion.div
                              animate={{ rotate: 300 }}
                              transition={{ duration: 1, ease: "easeInOut", repeat: Infinity }}
                              className="size-12"
                            >
                              <SpinnerBallIcon className="size-12" />
                            </motion.div>
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
                            className="size-12"
                          >
                            <PaperPlaneTiltIcon className="size-12 transition-transform duration-100 group-hover:translate-x-1 group-hover:-translate-y-1 group-active:translate-x-0 group-active:translate-y-0" />
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
            className="size-32 mx-auto rounded-full bg-primary border flex items-center justify-center"
          >
            <CheckIcon className="size-20 text-primary-foreground" weight="bold" />
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
              }} className="text-4xl md:text-7xl leading-tight">You're on the list!</motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={waitlistInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
                delay: 0.6
              }} className="text-muted md:text-lg">
              We'll notify you as soon as we go live on the mainnet.
            </motion.p>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
