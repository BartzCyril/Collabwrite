import { Link } from "react-router-dom"
import { LogIn, UserPlus, Menu, User, FileText, Folder, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/logo_collabwrite.png"
              alt="CollabWrite Logo"
              className="h-8 w-auto sm:h-12"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {user && (
              <>
                <Link to="/my-documents" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Mes documents
                </Link>
                <Link to="/my-folders" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                  <Folder className="h-4 w-4" />
                  Mes dossiers
                </Link>
              </>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                <Users className="h-4 w-4" />
                Gestion des utilisateurs
              </Link>
            )}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center gap-2">
                         {user ? (
               <>
                 <Link to="/profile">
                   <Button variant="ghost" size="sm" className="gap-2">
                     <User className="h-4 w-4" />
                     <span className="hidden md:inline">{user.fullName}</span>
                   </Button>
                 </Link>
               </>
             ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    <span className="hidden md:inline">Connexion</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden md:inline">Inscription</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 border-t pt-4 space-y-2">
            {/*<Link to="/" className="block px-4 py-2 hover:bg-muted rounded-md">
              Accueil
            </Link>*/}
            <div className="flex flex-col gap-2 px-4">
                {user && (
                  <>
                    <Link to="/my-documents" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                        <FileText className="h-4 w-4" />
                        Mes documents
                      </Button>
                    </Link>
                    <Link to="/my-folders" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                        <Folder className="h-4 w-4" />
                        Mes dossiers
                      </Button>
                    </Link>
                  </>
                )}
                {user && user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full gap-2 justify-start">
                      <Users className="h-4 w-4" />
                      Gestion des utilisateurs
                    </Button>
                  </Link>
                )}
                {user ? (
                 <>
                   <Link to="/profile">
                     <Button variant="outline" size="sm" className="w-full gap-2">
                       <User className="h-4 w-4" />
                       {user.fullName}
                     </Button>
                   </Link>
                 </>
                ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <LogIn className="h-4 w-4" />
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="w-full gap-2">
                      <UserPlus className="h-4 w-4" />
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
