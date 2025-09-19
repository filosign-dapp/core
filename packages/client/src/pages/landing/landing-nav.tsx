import Logo from "@/src/lib/components/custom/Logo";
import { Button } from "@/src/lib/components/ui/button";
import { LightningIcon, ListIcon, XIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
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
  const { ready, authenticated, login } = usePrivy();

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
    <section className="sticky top-10 z-50 p-page">
      <motion.nav
        className="flex justify-between items-center mx-auto max-w-3xl p-rect rounded-large glass text-background"
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
              className="font-medium transition-colors duration-200 hover:bg-foreground/50 rounded-md px-3 py-2"
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
          className=""
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
          {ready && authenticated ? (
            <Button variant="secondary" asChild>
              <Link to="/dashboard">
                Dashboard
              </Link>
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => {
              login();
            }}>
                Connect
            </Button>
          )}
        </motion.div>
      </motion.nav>
      
    </section>
  );
}
