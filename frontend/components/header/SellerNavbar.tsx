import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/helper/routes";

export function SellerNavbar() {
  return (
    <>
      <Link
        href={ROUTES.MY_SHOP}
        className="relative text-foreground hover:text-primary transition-colors font-medium pb-1 group"
      >
        Ma Boutique
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
      </Link>
    </>
  );
}
