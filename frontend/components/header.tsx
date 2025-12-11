import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, ShoppingCart } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-bold">
          Purple Dog
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Collection
          </Link>
          <Link
            href="/encheres"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Enchères
          </Link>
          <Link
            href="/vendre"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Vendre
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/connexion">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
