import { Github } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo_collabwrite.png" 
                alt="CollabWrite Logo" 
                className="h-8 w-auto sm:h-12"
              />
            </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              Éditeur de documents collaboratif en temps réel pour votre équipe.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                  Inscription
                </a>
              </li>
              <li>
                <a href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Connexion
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <a 
                  href="https://github.com/AlexisMetton/collabwrite" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CollabWrite. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
