"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/helper/routes";
import { Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ProNavbar } from "./ProNavbar";
import { SellerNavbar } from "./SellerNavbar";

export const GenericHeader = () => {
  const [isAuthenticated] = useState(true);
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={ROUTES.HOME} className="flex items-center space-x-2">
              <Image
                src="/purple-dog-logo.png"
                alt="Purple Dog Logo"
                width={120}
                height={120}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {isAuthenticated && (
                <>
                  <ProNavbar />
                  <SellerNavbar />
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 max-w-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-9 h-9 bg-secondary border-transparent focus:border-accent"
                />
              </div>
            </div>

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
          </div>
        </div>
      </div>
    </header>
  );
};

export default GenericHeader;
