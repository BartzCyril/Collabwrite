import { useState, useEffect } from "react"
import { UserPlus, Lock, Unlock, Search, X, ShieldCheck, ShieldOff, Edit, Save, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminService } from "@/services/admin.service"
import type { AdminUser, CreateUserData, UpdateUserData } from "@/services/admin.service"

interface User extends AdminUser {
  name: string
  has2FA: boolean
}

export function AdminDashboard() {
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<string | null>(null)

  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserRole, setNewUserRole] = useState("user")

  // États pour l'édition d'utilisateur
  const [editForm, setEditForm] = useState<UpdateUserData>({})

  // Charger les utilisateurs au montage du composant
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await adminService.getAllUsers()
      const formattedUsers = usersData.map(user => ({
        ...user,
        name: user.fullName,
        has2FA: user.totpEnabled
      }))
      setUsers(formattedUsers)
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBlock = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      const result = await adminService.toggleUserBlock(userId, !user.isBlocked)
      
      // Mettre à jour l'état local
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isBlocked: result.user.isBlocked } : u
      ))
      
      //alert(result.message)
    } catch (err) {
      //('Erreur lors du changement de statut')
      console.error('Erreur:', err)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userData: CreateUserData = {
        fullName: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole
      }

      const result = await adminService.createUser(userData)
      
      // Ajouter le nouvel utilisateur à la liste
      const newUser: User = {
        ...result.user,
        name: result.user.fullName,
        has2FA: result.user.totpEnabled
      }
      setUsers([newUser, ...users])
      
      // Réinitialiser le formulaire
      setShowAddUserForm(false)
      setNewUserName("")
      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserRole("user")

      //alert(result.message)
    } catch (err) {
      //alert('Erreur lors de la création de l\'utilisateur')
      console.error('Erreur:', err)
    }
  }

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      setEditingUser(userId)
      setEditForm({
        fullName: user.fullName,
        email: user.email,
        role: user.role
      })
    }
  }

  const handleSaveEdit = async (userId: string) => {
    try {
      const result = await adminService.updateUser(userId, editForm)
      
      // Mettre à jour l'état local
      setUsers(users.map(u => 
        u.id === userId ? { 
          ...u, 
          fullName: result.user.fullName,
          name: result.user.fullName,
          email: result.user.email,
          role: result.user.role
        } : u
      ))
      
      setEditingUser(null)
      setEditForm({})
      //alert(result.message)
    } catch (err) {
      //alert('Erreur lors de la mise à jour')
      console.error('Erreur:', err)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({})
  }

  const handleCancelAddUser = () => {
    setShowAddUserForm(false)
    setNewUserName("")
    setNewUserEmail("")
    setNewUserPassword("")
    setNewUserRole("user")
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Chargement des utilisateurs...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <div className="text-lg text-destructive mb-4">{error}</div>
              <Button onClick={loadUsers}>Réessayer</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-4 sm:py-6 md:py-12">
      <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
        <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Dashboard Admin</h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Gérez les utilisateurs et leurs accès
            </p>
          </div>
          {!showAddUserForm && (
            <Button onClick={() => setShowAddUserForm(true)} className="gap-2 w-full sm:w-auto" size="sm">
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Ajouter un utilisateur</span>
            </Button>
          )}
        </div>

        {showAddUserForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Créer un nouveau compte</CardTitle>
              <CardDescription>
                Ajoutez un nouvel utilisateur à la plateforme
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddUser}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newName">Nom complet</Label>
                    <Input
                      id="newName"
                      type="text"
                      placeholder="Jean Dupont"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="utilisateur@exemple.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newRole">Rôle</Label>
                    <select
                      id="newRole"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleCancelAddUser}
                  >
                    <X className="h-4 w-4" />
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1 gap-2">
                    <UserPlus className="h-4 w-4" />
                    Créer le compte
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl">Utilisateurs ({filteredUsers.length})</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Liste de tous les utilisateurs de la plateforme
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto sm:max-w-sm">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-7 sm:pl-9 text-xs sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="overflow-x-auto -mx-3 sm:-mx-6 px-3 sm:px-6">
              <table className="w-full min-w-[640px] sm:min-w-0">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-muted-foreground">
                      Nom
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-muted-foreground">
                      Rôle
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-muted-foreground">
                      Statut
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                      A2F
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                      Créé le
                    </th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          {editingUser === user.id ? (
                            <Input
                              value={editForm.fullName || ''}
                              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                              className="w-full text-xs sm:text-sm"
                            />
                          ) : (
                            <p className="font-medium text-xs sm:text-sm truncate">{user.name}</p>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          {editingUser === user.id ? (
                            <Input
                              value={editForm.email || ''}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="w-full text-xs sm:text-sm"
                            />
                          ) : (
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          {editingUser === user.id ? (
                            <select
                              value={editForm.role || ''}
                              onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                              className="flex h-8 sm:h-9 w-full rounded-md border border-input bg-transparent px-2 sm:px-3 py-1 text-xs sm:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="user">Utilisateur</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          {user.isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                              <Lock className="h-3 w-3" />
                              <span className="hidden sm:inline">Bloqué</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                              <Unlock className="h-3 w-3" />
                              <span className="hidden sm:inline">Actif</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 hidden md:table-cell">
                          {user.has2FA ? (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                              <ShieldCheck className="h-3 w-3" />
                              <span className="hidden lg:inline">Activé</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              <ShieldOff className="h-3 w-3" />
                              <span className="hidden lg:inline">Désactivé</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 hidden lg:table-cell">
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex gap-1 sm:gap-2 flex-wrap">
                            {editingUser === user.id ? (
                              <>
                                <Button
                                  size="sm"
                                  className="gap-1 text-xs"
                                  onClick={() => handleSaveEdit(user.id)}
                                >
                                  <Save className="h-3 w-3" />
                                  <span className="hidden sm:inline">Sauver</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-xs"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="hidden sm:inline">Annuler</span>
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 text-xs"
                                  onClick={() => handleEditUser(user.id)}
                                >
                                  <Edit className="h-3 w-3" />
                                  <span className="hidden sm:inline">Modifier</span>
                                </Button>
                                <Button
                                  variant={user.isBlocked ? "default" : "destructive"}
                                  size="sm"
                                  className="gap-1 text-xs"
                                  onClick={() => handleToggleBlock(user.id)}
                                >
                                  {user.isBlocked ? (
                                    <>
                                      <Unlock className="h-3 w-3" />
                                      <span className="hidden sm:inline">Débloquer</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="h-3 w-3" />
                                      <span className="hidden sm:inline">Bloquer</span>
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
