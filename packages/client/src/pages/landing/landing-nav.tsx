import { Button } from "@/src/lib/components/ui/button";
import { LightningIcon } from "@phosphor-icons/react";
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show navbar when at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else {
        // Hide when scrolling down, show when scrolling up
        setIsVisible(currentScrollY < lastScrollY);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <motion.nav
      className="flex justify-between items-center mx-auto max-w-3xl p-rect rounded-large glass text-background"
      initial={{ opacity: 0, y: -50 }}
      animate={{ 
        opacity: 1, 
        y: isVisible ? 0 : -200
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.8,
        delay: isVisible ? 0 : 0, // Remove delay when hiding
      }}
    >
      {/* Logo */}
      <div className="flex items-center">
        <div className="p-2 mr-3 rounded-xl bg-primary">
          <LightningIcon className="size-6 text-foreground" weight="fill" />
        </div>
        <h3 className="text-primary font-manrope">filosign</h3>
      </div>

      {/* Navigation Links */}
      <div className="hidden items-center space-x-4 md:flex">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="font-medium transition-colors duration-200 hover:bg-foreground/50 hover:text-primary rounded-md px-3 py-2"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CTA Button */}
      <Button variant="primary" asChild>
        <Link to="/dashboard">
          Sign in
        </Link>
      </Button>
    </motion.nav>
  );
}
