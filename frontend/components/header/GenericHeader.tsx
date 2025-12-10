"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/helper/routes";
import { useLogout } from "@/hooks/useAuth";
import { Menu, Search, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProNavbar } from "./ProNavbar";
import { SellerNavbar } from "./SellerNavbar";
import { useAuth } from "@/hooks/useAuth";

function getUserRoleFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const role = document.cookie
    .split("; ")
    .find((row) => row.startsWith("user_role="))
    ?.split("=")[1];
  return role ? decodeURIComponent(role) : null;
}

export const GenericHeader = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = useLogout();
  const user = useAuth();

  useEffect(() => {
    function checkAuth() {
      // Le cookie access_token est httpOnly, donc inaccessible depuis JavaScript
      // On vérifie uniquement user_role qui est accessible côté client
      const userRole = getUserRoleFromCookie();
      setIsAuthenticated(!!userRole);
      setRole(userRole);
    }

    checkAuth();

    // Vérifier périodiquement les cookies
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

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
                  {role === "particular" && <ProNavbar />}
                  {role === "professional" && (
                    <>
                      <ProNavbar />
                      <SellerNavbar />
                    </>
                  )}
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
                <>
                  <Button asChild variant="default">
                    <Link
                      href={ROUTES.MON_COMPTE}
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Mon compte
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                  >
                    Se déconnecter
                  </Button>
                </>
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

            {/* Menu hamburger mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 animate-in slide-in-from-top-2">
            <nav className="flex flex-col gap-4">
              {isAuthenticated && (
                <>
                  {role === "professional" && (
                    <div className="flex flex-col gap-3">
                      <Link
                        href={ROUTES.PRODUITS}
                        className="text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Produits
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Favoris
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Enchères
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Achats
                      </Link>
                    </div>
                  )}
                  {role === "particular" && (
                    <div className="flex flex-col gap-3">
                      <Link
                        href={ROUTES.PRODUITS}
                        className="text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Produits
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Favoris
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Enchères
                      </Link>
                      <Link
                        href="#"
                        className="text-sm font-medium hover:text-accent transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mes Achats
                      </Link>
                      <Link
                        href={ROUTES.MY_SHOP}
                        className="text-foreground hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Ma Boutique
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Barre de recherche mobile */}
              <div className="flex items-center gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    className="pl-9 h-9 bg-secondary border-transparent focus:border-accent"
                  />
                </div>
              </div>

              {/* Boutons d'authentification mobile */}
              <div className="flex flex-col gap-2 pt-2">
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="default" className="w-full">
                      <Link
                        href={ROUTES.MON_COMPTE}
                        className="flex items-center justify-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Mon compte
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        logoutMutation.mutate();
                        setMobileMenuOpen(false);
                      }}
                      disabled={logoutMutation.isPending}
                    >
                      Se déconnecter
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full">
                      <Link
                        href={ROUTES.CONNEXION}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Se connecter
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link
                        href={ROUTES.INSCRIPTION}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        S&apos;inscrire
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default GenericHeader;
