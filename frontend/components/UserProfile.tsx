"use client";

import { useAuth, useLogout } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, User } from "lucide-react";

export function UserProfile() {
  const { data: user, isLoading, error } = useAuth();
  const logoutMutation = useLogout();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  if (error || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {user.first_name} {user.last_name}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </>
        )}
      </Button>
    </div>
  );
}
