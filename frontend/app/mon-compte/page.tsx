"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function MonComptePage() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1>Mon compte</h1>
    </div>
  );
}
