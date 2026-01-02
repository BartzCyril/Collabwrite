import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LogIn, Shield } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import authService from "@/services/auth.service"

export function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [requires2FA, setRequires2FA] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (requires2FA) {
        // Vérifier le code 2FA
        const response = await authService.login({ 
          email, 
          password, 
          totpCode 
        })
        
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        setUser(response.user)
        navigate("/dashboard")
      } else {
        // Première tentative de connexion
        const response = await authService.login({ 
          email, 
          password 
        })

        // Vérifier si la 2FA est requise
        if (response.requires2FA) {
          setRequires2FA(true)
        } else {
          localStorage.setItem('accessToken', response.accessToken)
          localStorage.setItem('refreshToken', response.refreshToken)
          setUser(response.user)
          navigate("/dashboard")
        }
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <img 
              src="/logo_collabwrite.png" 
              alt="CollabWrite Logo"
              className="h-10 w-auto"
            />
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {requires2FA ? "Authentification à deux facteurs" : "Connexion"}
            </CardTitle>
            <CardDescription className="text-center">
              {requires2FA 
                ? "Entrez le code de votre application d'authentification"
                : "Entrez vos identifiants pour accéder à votre compte"
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!requires2FA ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="totpCode">Code 2FA</Label>
                  <Input
                    id="totpCode"
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                  <p className="text-xs text-muted-foreground">
                    Entrez le code à 6 chiffres de votre application d'authentification
                  </p>
                </div>
              )}
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {requires2FA ? (
                  <>
                    <Shield className="h-4 w-4" />
                    {loading ? "Vérification..." : "Vérifier"}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {loading ? "Connexion..." : "Se connecter"}
                  </>
                )}
              </Button>
              {requires2FA && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setRequires2FA(false)
                    setTotpCode("")
                    setError("")
                  }}
                >
                  Retour
                </Button>
              )}
            </CardContent>
          </form>
          <CardFooter className="flex flex-col space-y-4">
            {!requires2FA && (
              <div className="text-sm text-center text-muted-foreground">
                Vous n'avez pas de compte ?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  S'inscrire
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
