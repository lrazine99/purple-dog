"use client";

import { Button } from "@/components/ui/button";
import { Check, CreditCard, Clock, Zap, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { useSubscriptionCheckout } from "@/hooks/useSubscriptionCheckout";
import { useCancelSubscription } from "@/hooks/useCancelSubscription";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AbonnementPage() {
  const { data: user } = useAuth();
  const { subscription, isTrial, daysRemaining, isPaid } =
    useSubscriptionStatus();
  const checkoutMutation = useSubscriptionCheckout();
  const cancelMutation = useCancelSubscription();
  const router = useRouter();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (user && user.role !== "professional") {
    router.push("/");
    return null;
  }

  const handleSubscribe = () => {
    checkoutMutation.mutate();
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = () => {
    cancelMutation.mutate();
    setShowCancelConfirm(false);
  };

  if (user && user.role !== "professional") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choisissez votre plan
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Accédez à toutes les fonctionnalités professionnelles pour
            développer votre activité
          </p>
        </div>

        {subscription && (
          <div className="max-w-2xl mx-auto mb-8 md:mb-12 p-4 md:p-6 bg-card border border-border rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Statut actuel</p>
                <p className="text-lg md:text-xl font-semibold">
                  {isTrial ? "Essai gratuit" : "Plan payant"}
                </p>
                {isTrial && daysRemaining > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant
                    {daysRemaining > 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    subscription.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {subscription.status === "active" ? "Actif" : "Expiré"}
                </div>
                {isPaid && subscription.status === "active" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelClick}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Annuler"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full p-6 bg-card border border-border rounded-lg shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-bold">Annuler l'abonnement</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Êtes-vous sûr de vouloir annuler votre abonnement ? Vous perdrez
                l&apos;accès aux fonctionnalités premium.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Non, garder
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancelConfirm}
                >
                  Oui, annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto mb-12 md:mb-16">
          <div className="relative p-6 md:p-8 bg-card border-2 border-border rounded-2xl flex flex-col">
            <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 px-3 md:px-4 py-1 bg-accent text-accent-foreground text-xs md:text-sm font-medium rounded-full">
              Nouveau client
            </div>
            <div className="text-center mb-6">
              <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-accent" />
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                Essai gratuit
              </h3>
              <div className="mb-3 md:mb-4">
                <span className="text-3xl md:text-4xl font-bold">0€</span>
                <span className="text-sm md:text-base text-muted-foreground">
                  /mois
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Pendant 30 jours
              </p>
            </div>
            <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8 flex-grow">
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">
                  Accès complet à toutes les fonctionnalités
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">
                  Création illimitée de produits
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">
                  Participation aux enchères
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">Achats et ventes</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">Support par email</span>
              </li>
            </ul>
            <div>
              <Button
                variant="outline"
                className="w-full text-sm md:text-base"
                disabled
              >
                En cours
              </Button>
              <p className="text-[10px] md:text-xs text-center text-muted-foreground mt-2 md:mt-3 leading-tight">
                Après 30 jours, les achats et enchères seront bloqués
              </p>
            </div>
          </div>

          <div className="relative p-6 md:p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary rounded-2xl shadow-lg flex flex-col">
            <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 px-3 md:px-4 py-1 bg-primary text-primary-foreground text-xs md:text-sm font-medium rounded-full">
              Recommandé
            </div>
            <div className="text-center mb-6">
              <Zap className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 text-primary" />
              <h3 className="text-xl md:text-2xl font-bold mb-2">
                Plan Professionnel
              </h3>
              <div className="mb-3 md:mb-4">
                <span className="text-3xl md:text-4xl font-bold">49€</span>
                <span className="text-sm md:text-base text-muted-foreground">
                  /mois
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Facturation mensuelle
              </p>
            </div>
            <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8 flex-grow">
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm font-medium">
                  Tout du plan gratuit, sans interruption
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">
                  Achats et enchères illimités
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">
                  Statistiques avancées
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">
                  Promotion de vos produits
                </span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">Support prioritaire</span>
              </li>
              <li className="flex items-start gap-2 md:gap-3">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm">
                  Badge professionnel vérifié
                </span>
              </li>
            </ul>
            <div>
              <Button
                className="w-full text-sm md:text-base"
                size="lg"
                onClick={handleSubscribe}
                disabled={checkoutMutation.isPending || isPaid}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    {isPaid ? "Déjà abonné" : "S'abonner maintenant"}
                  </>
                )}
              </Button>
              <p className="text-[10px] md:text-xs text-center text-muted-foreground mt-3 md:mt-4 leading-tight">
                Paiement sécurisé • Annulation à tout moment
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-3 md:space-y-4">
            <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2 text-sm md:text-base">
                Puis-je annuler à tout moment ?
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Oui, vous pouvez annuler votre abonnement à tout moment. Vous
                conserverez l&apos;accès jusqu&apos;à la fin de votre période de
                facturation.
              </p>
            </div>
            <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2 text-sm md:text-base">
                Que se passe-t-il après l&apos;essai gratuit ?
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Après 30 jours, vous devrez souscrire au plan professionnel à
                49€/mois pour continuer à accéder aux fonctionnalités. Aucun
                paiement automatique n&apos;est effectué.
              </p>
            </div>
            <div className="p-4 md:p-6 bg-card border border-border rounded-lg">
              <h3 className="font-semibold mb-2 text-sm md:text-base">
                Quels moyens de paiement acceptez-vous ?
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Nous acceptons les cartes bancaires (Visa, Mastercard, American
                Express) et les virements bancaires.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 md:mt-16">
          <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
            Besoin d&apos;aide ? Contactez notre équipe
          </p>
          <Button variant="link" asChild className="text-sm md:text-base">
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
