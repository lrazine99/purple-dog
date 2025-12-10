"use client";

import { LoginForm } from "@/components/form/LoginForm";
import { CustomLogo } from "@/components/ui/custom-logo";
import { ROUTES } from "@/helper/routes";

export const dynamic = "force-dynamic";

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CustomLogo href={ROUTES.HOME} size="lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Connexion</h1>
            <p className="text-muted-foreground">
              Connectez-vous à votre compte
            </p>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
