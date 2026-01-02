import api from './api';

export interface LoginData {
  email: string;
  password: string;
  totpCode?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  requires2FA?: boolean;
  message?: string;
}

export interface Setup2FAResponse {
  secret: string;
  qrCode: string;
}

export interface Verify2FAData {
  code: string;
}

export interface UpdateProfileData {
  fullName: string;
  email: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    //console.log('[AuthService] login called with:', { email: data.email, hasTotpCode: !!data.totpCode });
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      //console.log('[AuthService] Login response:', response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      console.error('[AuthService] Login error:', error);
      console.error('[AuthService] Error response:', axiosError.response?.data);
      throw error;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async setup2FA() {
    const response = await api.post<Setup2FAResponse>('/auth/setup-2fa');
    return response.data;
  },

  async verify2FA(data: Verify2FAData) {
    const response = await api.post('/auth/verify-2fa', data);
    return response.data;
  },

  async disable2FA() {
    const response = await api.post('/auth/disable-2fa');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData) {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  async updatePassword(data: UpdatePasswordData) {
    const response = await api.put('/auth/password', data);
    return response.data;
  },
};

export default authService;
