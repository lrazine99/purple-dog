"use client";

import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MonComptePage() {
  const { data: user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (!isLoading && user?.role === "admin") {
      router.push("/admin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render for admins (they'll be redirected)
  if (user?.role === "admin") {
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
