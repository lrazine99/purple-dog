"use client";

import { useState } from "react";
import { SwitchButton } from "@/components/design-system/buttons/SwitchButton";
import { ParticularRegisterForm } from "@/components/auth/ParticularRegisterForm";
import { ProfessionalRegisterForm } from "@/components/auth/ProfessionalRegisterForm";
import { UserRole } from "@/lib/type/user-roe.enum";
import { ROLE_OPTIONS } from "@/lib/const";
import { CustomLogo } from "@/components/ui/custom-logo";
import { ROUTES } from "@/helper/routes";

export default function InscriptionPage() {
  const [role, setRole] = useState<UserRole>("particular");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CustomLogo href={ROUTES.HOME} size="lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Créer un compte</h1>
            <p className="text-muted-foreground">
              Choisissez votre type de compte et remplissez le formulaire
            </p>
          </div>
        </div>

        <SwitchButton
          value={role}
          options={ROLE_OPTIONS}
          onChange={setRole}
          className="max-w-md mx-auto"
        />

        {role === "particular" ? (
          <ParticularRegisterForm />
        ) : (
          <ProfessionalRegisterForm />
        )}
      </div>
    </div>
  );
}
