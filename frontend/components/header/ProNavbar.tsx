import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/helper/routes";

export function ProNavbar() {
  return (
    <>
      <Link
        href={ROUTES.PRODUITS}
        className="relative text-foreground hover:text-primary transition-colors font-medium pb-1 group"
      >
        Produits
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link
        href="#"
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
    </>
  );
}
