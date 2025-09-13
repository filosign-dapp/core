import Logo from "@/src/lib/components/custom/Logo";
import { Button } from "@/src/lib/components/ui/button";
import { LightningIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export default function LandingNavbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        setIsVisible(currentScrollY < lastScrollY);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <section className="sticky top-2 md:top-10 z-50 p-4 md:p-page">
      <motion.nav
        className="flex justify-between items-center mx-auto max-w-3xl p-4 md:p-rect rounded-large glass text-background"
        initial={{ opacity: 0, y: -50 }}
        animate={{
          opacity: 1,
          y: isVisible ? 0 : -200
        }}
        transition={{
          type: "spring",
          stiffness: 230,
          damping: 25,
          mass: 1.0,
          delay: 0,
        }}
      >
        {/* Logo */}
        <Logo textDelay={0.35} iconDelay={0.26} className="px-0" />

        {/* Desktop Navigation Links */}
        <motion.div
          className="hidden items-center space-x-4 md:flex"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 230,
            damping: 25,
            delay: 0.43
          }}
        >
          {navLinks.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="font-medium transition-colors duration-200 hover:bg-foreground/50 hover:text-primary rounded-md px-3 py-2"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 230,
                damping: 25,
                delay: 0.52 + (index * 0.087)
              }}
            >
              {link.label}
            </motion.a>
          ))}
        </motion.div>

        {/* Desktop CTA Button */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 230,
            damping: 30,
            mass: 1.2,
            delay: 0.78
          }}
        >
          <Button variant="secondary" asChild>
            <Link to="/dashboard">
              Sign in
            </Link>
          </Button>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2 rounded-md hover:bg-foreground/10 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 230,
            damping: 30,
            mass: 1.2,
            delay: 0.78
          }}
        >
          {isMobileMenuOpen ? (
            <XIcon className="w-6 h-6" />
          ) : (
            <ListIcon className="w-6 h-6" />
          )}
        </motion.button>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        className="md:hidden mt-4 mx-auto max-w-3xl"
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? "auto" : 0
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        <div className="glass rounded-large p-4 space-y-4">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              className="block font-medium text-secondary transition-colors duration-200 hover:bg-foreground/50 rounded-md px-3 py-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: isMobileMenuOpen ? 1 : 0, 
                x: isMobileMenuOpen ? 0 : -20 
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: index * 0.1
              }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </motion.a>
          ))}
          <motion.div
            className="pt-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: isMobileMenuOpen ? 1 : 0, 
              x: isMobileMenuOpen ? 0 : -20 
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: navLinks.length * 0.1
            }}
          >
            <Button variant="secondary" asChild className="w-full">
              <Link to="/dashboard">
                Sign in
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
