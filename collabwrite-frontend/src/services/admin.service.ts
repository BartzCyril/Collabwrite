import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  totpEnabled: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  role?: string;
}

export const adminService = {
  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>('/auth/admin/users');
    return response.data;
  },

  // Bloquer/Débloquer un utilisateur
  async toggleUserBlock(userId: string, isBlocked: boolean): Promise<{ message: string; user: AdminUser }> {
    const response = await api.put(`/auth/admin/users/${userId}/block`, { isBlocked });
    return response.data;
  },

  // Modifier les informations d'un utilisateur
  async updateUser(userId: string, userData: UpdateUserData): Promise<{ message: string; user: AdminUser }> {
    const response = await api.put(`/auth/admin/users/${userId}`, userData);
    return response.data;
  },

  // Créer un nouvel utilisateur
  async createUser(userData: CreateUserData): Promise<{ message: string; user: AdminUser }> {
    const response = await api.post('/auth/admin/users', userData);
    return response.data;
  }
};
