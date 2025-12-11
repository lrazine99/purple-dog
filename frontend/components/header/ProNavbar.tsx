import { ROUTES } from "@/helper/routes";
import Link from "next/link";

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
        href={ROUTES.FAVORIS}
        className="relative text-foreground hover:text-primary transition-colors font-medium pb-1 group"
      >
        Mes Favoris
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <Link
        href={ROUTES.MES_ENCHERES}
        className="relative text-foreground hover:text-primary transition-colors font-medium pb-1 group"
      >
        Mes Enchères
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <Link
        href={ROUTES.MA_BOUTIQUE}
        className="relative text-foreground hover:text-primary transition-colors font-medium pb-1 group"
      >
        Mes Achats
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
    </>
  );
}
