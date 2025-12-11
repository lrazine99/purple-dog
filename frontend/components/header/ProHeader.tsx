import Link from "next/link";
import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubscriptionExpiredBanner } from "@/components/subscription/SubscriptionExpiredBanner";

export function ProHeader() {
  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary" />
                <span className="font-serif text-xl font-semibold tracking-tight">
                  Purple Dog
                </span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/favoris"
                  className="text-sm font-medium hover:text-accent transition-colors"
                >
                  Mes Favoris
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium hover:text-accent transition-colors"
                >
                  Mes Enchères
                </Link>
                <Link
                  href="#"
                  className="text-sm font-medium hover:text-accent transition-colors"
                >
                  Mes Achats
                </Link>
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

              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon-lg">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <SubscriptionExpiredBanner />
    </>
  );
}
