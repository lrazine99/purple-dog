"use client";

import { LoginForm } from "@/components/auth/LoginForm";

export default function ConnexionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Connexion</h1>
          <p className="text-muted-foreground">
            Connectez-vous à votre compte
          </p>
        </div>

        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
