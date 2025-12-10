"use client";

import { Button } from "@/components/ui/button";
import { Check, CreditCard, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { useRouter } from "next/navigation";

export default function AbonnementPage() {
  const { data: user } = useAuth();
  const { subscription, isTrial, daysRemaining } = useSubscriptionStatus();
  const router = useRouter();

  if (user && user.role !== "professional") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Accédez à toutes les fonctionnalités professionnelles pour
            développer votre activité
          </p>
        </div>

        {subscription && (
          <div className="max-w-2xl mx-auto mb-12 p-6 bg-card border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Statut actuel</p>
                <p className="text-xl font-semibold">
                  {isTrial ? "Essai gratuit" : "Plan payant"}
                </p>
                {isTrial && daysRemaining > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant
                    {daysRemaining > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  subscription.status === "active"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {subscription.status === "active" ? "Actif" : "Expiré"}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <div className="relative p-8 bg-card border-2 border-border rounded-2xl flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground text-sm font-medium rounded-full">
              Nouveau client
            </div>
            <div className="text-center mb-6">
              <Clock className="h-12 w-12 mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold mb-2">Essai gratuit</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">0€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground">Pendant 30 jours</p>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Accès complet à toutes les fonctionnalités
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Création illimitée de produits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Participation aux enchères</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Achats et ventes</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Support par email</span>
              </li>
            </ul>
            <div>
              <Button variant="outline" className="w-full" disabled>
                En cours
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Après 30 jours, les achats et enchères seront bloqués
              </p>
            </div>
          </div>

          <div className="relative p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary rounded-2xl shadow-lg flex flex-col">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
              Recommandé
            </div>
            <div className="text-center mb-6">
              <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Plan Professionnel</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">49€</span>
                <span className="text-muted-foreground">/mois</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Facturation mensuelle
              </p>
            </div>
            <ul className="space-y-3 mb-8 flex-grow">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">
                  Tout du plan gratuit, sans interruption
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Achats et enchères illimités</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Statistiques avancées</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Promotion de vos produits</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Support prioritaire</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">Badge professionnel vérifié</span>
              </li>
            </ul>
            <div>
              <Button className="w-full" size="lg">
                <CreditCard className="h-4 w-4 mr-2" />
                S&apos;abonner maintenant
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Paiement sécurisé • Annulation à tout moment
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <div className="p-6 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">
                Puis-je annuler à tout moment ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Oui, vous pouvez annuler votre abonnement à tout moment. Vous
                conserverez l&apos;accès jusqu&apos;à la fin de votre période de
                facturation.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">
                Que se passe-t-il après l&apos;essai gratuit ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Après 30 jours, vous devrez souscrire au plan professionnel à
                49€/mois pour continuer à accéder aux fonctionnalités. Aucun
                paiement automatique n&apos;est effectué.
              </p>
            </div>
            <div className="p-6 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2">
                Quels moyens de paiement acceptez-vous ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Nous acceptons les cartes bancaires (Visa, Mastercard, American
                Express) et les virements bancaires.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-sm text-muted-foreground mb-4">
            Besoin d&apos;aide ? Contactez notre équipe
          </p>
          <Button variant="link" asChild>
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
