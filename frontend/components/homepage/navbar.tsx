"use client";

import { Button } from "@/components/ui/button";
import { CustomLogo } from "@/components/ui/custom-logo";
import { ROUTES } from "@/helper/routes";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <CustomLogo href={ROUTES.HOME} size="lg" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.CONNEXION}>Se connecter</Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.INSCRIPTION}>S&apos;inscrire</Link>
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container flex flex-col gap-2 p-4">
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href={ROUTES.CONNEXION} onClick={toggleMenu}>
                Se connecter
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href={ROUTES.INSCRIPTION} onClick={toggleMenu}>
                S&apos;inscrire
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
