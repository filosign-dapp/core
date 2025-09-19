import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { GithubLogoIcon, TwitterLogoIcon, LinkedinLogoIcon, EnvelopeIcon, LightningIcon } from "@phosphor-icons/react";
import Logo from "@/src/lib/components/custom/Logo";

export default function FooterSection() {
  return (
    <div className="bg-card">
      <footer className="max-w-6xl mx-auto p-4 md:p-page py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            duration: 0.6
          }}
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col gap-8 md:gap-12"
        >
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {/* Brand Section */}
            <div className="col-span-1 sm:col-span-2 md:col-span-2 space-y-4">
              <Logo className="px-0" textClassName="text-foreground font-bold" />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm"
              >
                Trustless document signing for the modern web. Secure, fast, and easy-to-use document signing on Filecoin.
              </motion.p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3 md:space-y-4">
              <motion.h4
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-sm sm:text-base font-medium text-foreground"
              >
                Product
              </motion.h4>
              <motion.nav
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col gap-2 md:gap-3"
              >
                <Link to="/dashboard" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Get Started
                </Link>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Features
                </a>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Pricing
                </a>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Documentation
                </a>
              </motion.nav>
            </div>

            {/* Company Links */}
            <div className="space-y-3 md:space-y-4">
              <motion.h4
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="text-sm sm:text-base font-medium text-foreground"
              >
                Company
              </motion.h4>
              <motion.nav
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="flex flex-col gap-2 md:gap-3"
              >
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  About
                </a>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Blog
                </a>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Careers
                </a>
                <a href="#" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Contact
                </a>
              </motion.nav>
            </div>
          </div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6"
          >
            <span className="text-sm text-muted-foreground">Follow us:</span>
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors duration-200"
              >
                <GithubLogoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors duration-200"
              >
                <TwitterLogoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors duration-200"
              >
                <LinkedinLogoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
              </motion.a>
              <motion.a
                href="mailto:hello@filosign.com"
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-card hover:bg-secondary transition-colors duration-200"
              >
                <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground transition-colors duration-200" />
              </motion.a>
            </div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="pt-6 md:pt-8 border-t border-border"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                © 2025 Filosign. All rights reserved.
              </p>
              <div className="flex items-center gap-4 sm:gap-6">
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Privacy Policy
                </a>
                <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline hover:underline-offset-4">
                  Terms of Service
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </footer>
    </div>
  );
}