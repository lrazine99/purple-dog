"use client";

import GenericHeader from "@/components/header/GenericHeader";
import { SubscriptionExpiredBanner } from "@/components/subscription/SubscriptionExpiredBanner";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  if (pathname.includes("admin")) return null;
  return (
    <>
      <GenericHeader />
      <SubscriptionExpiredBanner />
      {children}
    </>
  );
}
