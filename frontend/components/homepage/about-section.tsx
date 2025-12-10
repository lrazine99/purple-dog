import { Card } from "@/components/ui/card"
import { Shield, Users, TrendingUp, Award } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Tiers de Confiance",
    description: "Acheteurs vérifiés et transactions sécurisées",
  },
  {
    icon: Users,
    title: "Experts Certifiés",
    description: "Évaluation professionnelle de vos objets",
  },
  {
    icon: TrendingUp,
    title: "Meilleur Prix",
    description: "Maximisez la valeur de vos biens",
  },
  {
    icon: Award,
    title: "Service Premium",
    description: "Accompagnement personnalisé",
  },
]

export default function AboutSection() {
  return (
    <section className="bg-primary/5 py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-left">
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">Purple Dog</h2>
          <p className="mt-6 text-xl font-medium text-primary md:text-2xl">
            LA plateforme pour vendre mieux vos objets de valeur à des tiers de confiance
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Purple Dog révolutionne la vente d'objets d'art et de collection en créant un pont entre vendeurs passionnés
            et acheteurs sérieux. Notre plateforme garantit authenticité, transparence et valorisation optimale de vos
            biens précieux.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="group border-2 border-border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
