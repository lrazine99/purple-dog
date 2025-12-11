"use client";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/helper/routes";
import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold text-primary">
            Purple Dog
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href={ROUTES.PRODUITS}
            className="relative text-foreground hover:text-primary transition-colors font-medium pb-1 group"
          >
            Produits
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Button asChild variant="default">
              <Link
                href={ROUTES.MON_COMPTE}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Mon compte
              </Link>
            </Button>
          ) : (
            <>
          <Button variant="ghost" asChild>
            <Link href={ROUTES.CONNEXION}>Se connecter</Link>
          </Button>
          <Button asChild>
            <Link href={ROUTES.INSCRIPTION}>S&apos;inscrire</Link>
          </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
          <nav className="container flex flex-col gap-2 p-4">
            <Link
              href={ROUTES.PRODUITS}
              onClick={toggleMenu}
              className="px-4 py-2 text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors font-medium"
            >
              Produits
            </Link>
            {isAuthenticated ? (
              <Button asChild className="w-full justify-start">
                <Link
                  href={ROUTES.MON_COMPTE}
                  onClick={toggleMenu}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Mon compte
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                >
              <Link href={ROUTES.CONNEXION} onClick={toggleMenu}>
                Se connecter
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href={ROUTES.INSCRIPTION} onClick={toggleMenu}>
                S&apos;inscrire
              </Link>
            </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
