import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CustomLogo } from "@/components/ui/custom-logo"
import { ROUTES } from "@/helper/routes"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Logo et description */}
          <div className="space-y-4">
            <CustomLogo href={ROUTES.HOME} size="lg" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              La plateforme de confiance pour la vente d'objets d'art et de collection depuis 2024.
            </p>
          </div>

          {/* Liens légaux */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">Informations</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href={ROUTES.MENTIONS_LEGALES}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Mentions Légales
              </Link>
              <Link
                href={ROUTES.QUI_SOMMES_NOUS}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Qui Sommes-Nous ?
              </Link>
              <Link
                href={ROUTES.CONFIDENTIALITE}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Politique de Confidentialité
              </Link>
              <Link href={ROUTES.CGU} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Conditions Générales
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">Contact</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Une question ? Notre équipe est à votre écoute.
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground md:w-auto bg-transparent"
            >
              <Link href={ROUTES.CONTACT}>Nous contacter</Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Purple Dog. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
