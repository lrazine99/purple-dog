"use client";

import GenericHeader from "@/components/header/GenericHeader";
import { SubscriptionExpiredBanner } from "@/components/subscription/SubscriptionExpiredBanner";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <GenericHeader />
      <SubscriptionExpiredBanner />
      {children}
    </>
  );
}
