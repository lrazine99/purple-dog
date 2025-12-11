"use client";

import { ROUTES } from "@/helper/routes";
import Link from "next/link";

export interface SellerNavbarProps {
  onLinkClick?: () => void;
  className?: string;
}

export function SellerNavbar({ onLinkClick, className = "" }: SellerNavbarProps) {
  const linkClassName = `relative text-foreground hover:text-primary transition-colors font-medium pb-1 group ${className}`;

  return (
    <>
      <Link
        href={ROUTES.MA_BOUTIQUE}
        className={linkClassName}
        onClick={onLinkClick}
      >
        Ma Boutique
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
    </>
  );
}
