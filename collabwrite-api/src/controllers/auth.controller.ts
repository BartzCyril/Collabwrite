import { type Request, type Response } from 'express';
import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util.js';
import { generateTOTPSecret, verifyTOTP, generateTOTPURL, generateQRCode } from '../utils/totp.util.js';
import type { RegisterDTO, LoginDTO, Verify2FADTO, UpdateProfileDTO, UpdatePasswordDTO } from '../types/auth.types.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const authController = {
  async register(req: Request<{}, {}, RegisterDTO>, res: Response) {
    try {
      const { email, password, fullName } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      // Créer l'utilisateur
      const user = await userService.createUser(email, password, fullName);

      // Générer les tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      // Créer la session avec les informations de connexion
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await authService.createSession(user.id, refreshToken, ipAddress, userAgent);

      res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
  },

  async login(req: Request<{}, {}, LoginDTO>, res: Response) {
    try {
      const { email, password } = req.body;

      // Vérifier les identifiants
      let user;
      try {
        user = await userService.verifyUserCredentials(email, password);
        if (!user) {
          return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Compte bloqué') {
          return res.status(401).json({ error: 'Votre compte est bloqué' });
        }
        throw error;
      }

      // Si l'utilisateur a activé la 2FA, demander le code TOTP
      if (user.totp_enabled && !req.body.totpCode) {
        return res.status(200).json({
          requires2FA: true,
          message: 'Code 2FA requis',
        });
      }

      // Si 2FA activé, vérifier le code
      if (user.totp_enabled && req.body.totpCode) {
        const isValid = verifyTOTP(req.body.totpCode, user.totp_secret);
        if (!isValid) {
          return res.status(401).json({ error: 'Code 2FA invalide' });
        }
      }

      // Générer les tokens
      const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

      // Créer la session avec les informations de connexion
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      await authService.createSession(user.id, refreshToken, ipAddress, userAgent);

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.body?.refreshToken;

      if (refreshToken) {
        await authService.deleteSession(refreshToken);
      }

      res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      res.status(500).json({ error: 'Erreur lors de la déconnexion' });
    }
  },

  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const user = await userService.findUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      res.json(user);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  },

  async setup2FA(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const user = await userService.findUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      const secret = generateTOTPSecret();
      const otpURL = generateTOTPURL(user.email, secret);
      const qrCode = await generateQRCode(otpURL);

      // Activer immédiatement la 2FA (sans vérification du code)
      await userService.updateUser2FA(userId, secret, true);

      res.json({
        secret,
        qrCode,
        message: '2FA activée avec succès',
      });
    } catch (error) {
      console.error('Erreur lors de la configuration de la 2FA:', error);
      res.status(500).json({ error: 'Erreur lors de la configuration de la 2FA' });
    }
  },

  async verify2FA(req: Request<{}, {}, Verify2FADTO>, res: Response) {
    try {
      const userId = (req as AuthRequest).userId;
      const { code } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { secret } = await authService.getUserSecret(userId);

      if (!secret) {
        return res.status(400).json({ error: 'La 2FA n\'a pas été configurée' });
      }

      const isValid = verifyTOTP(code, secret);

      if (!isValid) {
        return res.status(401).json({ error: 'Code 2FA invalide' });
      }

      // Activer la 2FA pour l'utilisateur
      await userService.updateUser2FA(userId, null, true);

      res.json({ message: '2FA activée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la vérification de la 2FA:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification de la 2FA' });
    }
  },

  async disable2FA(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Désactiver la 2FA en mettant totp_enabled à false et en supprimant le secret
      await userService.updateUser2FA(userId, null, false);

      res.json({ message: '2FA désactivée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la désactivation de la 2FA:', error);
      res.status(500).json({ error: 'Erreur lors de la désactivation de la 2FA' });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token manquant' });
      }

      const newAccessToken = await authService.refreshAccessToken(refreshToken);

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      res.status(401).json({ error: 'Token de rafraîchissement invalide' });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { fullName, email } = req.body as UpdateProfileDTO;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      const updatedUser = await userService.updateProfile(userId, fullName, email);

      res.json(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
  },

  async updatePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body as UpdatePasswordDTO;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' });
      }

      await userService.updatePassword(userId, currentPassword, newPassword);

      res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      if (error instanceof Error && error.message === 'Mot de passe actuel incorrect') {
        return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
      }
      res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe' });
    }
  },
};
