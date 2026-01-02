export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  totpCode?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface Setup2FAResponse {
  secret: string;
  qrCode: string;
}

export interface Verify2FADTO {
  code: string;
}

export interface UpdateProfileDTO {
  fullName: string;
  email: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

import type { Request } from 'express';

export interface AuthRequest extends Request {
  userId: string;
  email: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
