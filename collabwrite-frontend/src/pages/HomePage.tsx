import { FileText, Users, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Écrivez ensemble,{" "}
          <span className="text-primary">collaborez en temps réel</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
          CollabWrite est une plateforme collaborative permettant à votre équipe de créer 
          et éditer des documents simultanément avec synchronisation instantanée.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Commencer gratuitement
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Se connecter
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 md:mb-12">
          Pourquoi choisir CollabWrite ?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Collaboration en temps réel</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Travaillez simultanément avec votre équipe sans conflit de version.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Synchronisation instantanée</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Vos modifications sont synchronisées instantanément pour tous les utilisateurs.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Édition intuitive</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Interface simple et moderne pour une expérience utilisateur optimale.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Sécurisé</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Vos documents sont protégés avec un chiffrement de niveau entreprise.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <Card className="p-8 md:p-12 text-center bg-primary/5">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Prêt à commencer ?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
            Rejoignez la communauté des utilisateurs qui font confiance à CollabWrite pour collaborer sur leurs documents.
          </p>
          <Link to="/register" className="inline-block">
            <Button size="lg" className="gap-2">
              Créer un compte gratuit
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}
