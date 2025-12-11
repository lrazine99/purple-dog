import { ROUTES } from "@/helper/routes";
import Link from "next/link";

interface ProNavbarProps {
  onLinkClick?: () => void;
}

export function ProNavbar({ onLinkClick }: ProNavbarProps) {
  const linkClassName = "relative text-foreground hover:text-primary transition-colors font-medium pb-1 group";
  const mobileLinkClassName = "relative text-foreground hover:text-primary transition-colors font-medium pb-1 group py-2";

  return (
    <>
      <Link
        href={ROUTES.PRODUITS}
        className={linkClassName}
        onClick={onLinkClick}
      >
        Produits
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>

      <Link
        href={ROUTES.FAVORIS}
        className={linkClassName}
        onClick={onLinkClick}
      >
        Mes Favoris
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <Link
        href={ROUTES.MES_ENCHERES}
        className={linkClassName}
        onClick={onLinkClick}
      >
        Mes Enchères
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
      <Link
        href={ROUTES.MA_BOUTIQUE}
        className={linkClassName}
        onClick={onLinkClick}
      >
        Mes Achats
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
    </>
  );
}
