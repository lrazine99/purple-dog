"use client";

import { UserProfile } from "@/components/auth/UserProfile";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Mon Compte</h1>

          <div className="space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">
                Informations du profil
              </h2>
              <UserProfile />
            </div>

            {user && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Détails du compte</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Prénom</p>
                    <p className="font-medium">{user.first_name}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-medium">{user.last_name}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Rôle</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>

                  {user.company_name && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Entreprise</p>
                      <p className="font-medium">{user.company_name}</p>
                    </div>
                  )}

                  {user.siret && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">SIRET</p>
                      <p className="font-medium">{user.siret}</p>
                    </div>
                  )}

                  {user.address_line && (
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                      <p className="text-sm text-gray-600">Adresse</p>
                      <p className="font-medium">
                        {user.address_line}
                        {user.city && `, ${user.postal_code} ${user.city}`}
                        {user.country && `, ${user.country}`}
                      </p>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Compte vérifié</p>
                    <p className="font-medium">
                      {user.is_verified ? (
                        <span className="text-green-600">✓ Vérifié</span>
                      ) : (
                        <span className="text-orange-600">
                          ⚠ En attente de vérification
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Newsletter</p>
                    <p className="font-medium">
                      {user.newsletter ? "Activée" : "Désactivée"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
