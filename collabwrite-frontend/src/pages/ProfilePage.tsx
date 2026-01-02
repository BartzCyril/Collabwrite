import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Shield, LogOut, Lock } from "lucide-react"
import authService from "@/services/auth.service"

export function ProfilePage() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.totpEnabled || false)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")

  useEffect(() => {
    if (user) {
      //console.log('User updated:', user)
      //console.log('totpEnabled:', user.totpEnabled)
      setFullName(user.fullName)
      setEmail(user.email)
      setIs2FAEnabled(user.totpEnabled || false)
    }
  }, [user])

  const handleUpdateProfile = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const updatedUser = await authService.updateProfile({ fullName, email })
      setMessage("Profil mis à jour avec succès")
      setUser(updatedUser)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || "Erreur lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    setPasswordLoading(true)
    setPasswordError("")
    setPasswordMessage("")

    try {
      await authService.updatePassword({ currentPassword, newPassword })
      setPasswordMessage("Mot de passe mis à jour avec succès")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setPasswordError(error.response?.data?.error || "Erreur lors de la mise à jour du mot de passe")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    try {
      const response = await authService.setup2FA()
      setQrCode(response.qrCode)
      setShow2FASetup(true)
      setError("")
      setMessage("2FA activée avec succès ! Scannez le QR code avec votre application d'authentification.")
      
      // Mettre à jour l'état immédiatement
      setIs2FAEnabled(true)
      //console.log('2FA enabled locally, is2FAEnabled:', true)
      
      // Rafraîchir les données utilisateur
      //console.log('Calling getCurrentUser after 2FA activation...')
      const updatedUser = await authService.getCurrentUser()
      //console.log('Updated user from API:', updatedUser)
      setUser(updatedUser)
      
      // Cacher le setup après 30 secondes pour laisser le temps de scanner le QR code
      setTimeout(() => {
        setShow2FASetup(false)
        setMessage("2FA activée ! Vous pouvez maintenant vous déconnecter et vous reconnecter pour tester.")
      }, 30000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || "Erreur lors de la configuration 2FA")
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm("Êtes-vous sûr de vouloir désactiver la 2FA ?")) return

    try {
      await authService.disable2FA()
      setMessage("2FA désactivée avec succès")
      setIs2FAEnabled(false)
      
      const updatedUser = await authService.getCurrentUser()
      setUser(updatedUser)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || "Erreur lors de la désactivation")
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <p className="text-muted-foreground mt-2">Gérez vos informations et préférences</p>
        </div>

        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
              />
            </div>
            {message && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                {message}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </CardContent>
        </Card>

        {/* Changement de mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Mot de passe
            </CardTitle>
            <CardDescription>Changez votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            {passwordMessage && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                {passwordMessage}
              </div>
            )}
            {passwordError && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                {passwordError}
              </div>
            )}
            <Button onClick={handleUpdatePassword} disabled={passwordLoading}>
              {passwordLoading ? "Mise à jour..." : "Changer le mot de passe"}
            </Button>
          </CardContent>
        </Card>

        {/* Authentification à deux facteurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>Gérez votre authentification à deux facteurs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* État actuel de la 2FA */}
            {is2FAEnabled && (
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-800">2FA Activée</p>
                  <p className="text-sm text-green-600">Votre compte est sécurisé par l'authentification à deux facteurs</p>
                </div>
                <Button onClick={handleDisable2FA} variant="destructive" size="sm">
                  Désactiver
                </Button>
              </div>
            )}

                         {/* Affichage du QR code (2FA déjà activée) */}
             {show2FASetup && qrCode && (
               <div className="space-y-4 p-4 bg-muted rounded-lg">
                 <p className="text-sm font-medium">Scannez ce QR code avec votre application d'authentification :</p>
                 <div className="flex justify-center">
                   <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                 </div>
                 <p className="text-sm text-center text-muted-foreground">
                   La 2FA est maintenant activée. Scannez le QR code pour configurer votre application.
                 </p>
                 <Button
                   variant="outline"
                   className="w-full"
                   onClick={() => {
                     setShow2FASetup(false)
                     setMessage("2FA activée ! Vous pouvez maintenant vous déconnecter et vous reconnecter pour tester.")
                   }}
                 >
                   J'ai scanné le QR code
                 </Button>
               </div>
             )}

            {/* Bouton pour activer la 2FA */}
            {!show2FASetup && !is2FAEnabled && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                </p>
                <Button onClick={handleSetup2FA} variant="outline">
                  Activer la 2FA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Déconnexion */}
        <Card>
          <CardHeader>
            <CardTitle>Zone sensible</CardTitle>
            <CardDescription>Actions importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout} className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
