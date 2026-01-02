import type { Request, Response } from 'express';
import type { AuthRequest } from '../types/auth.types.js';
import { userService } from '../services/user.service.js';
import { validate } from '../middleware/validate.middleware.js';
import { body } from 'express-validator';

export const adminController = {
  // Récupérer tous les utilisateurs
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  },

  // Bloquer/Débloquer un utilisateur
  async toggleUserBlock(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { isBlocked } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'ID utilisateur manquant' });
      }

      if (typeof isBlocked !== 'boolean') {
        return res.status(400).json({ error: 'isBlocked doit être un booléen' });
      }

      const updatedUser = await userService.updateUserBlockStatus(userId, isBlocked);
      
      res.json({
        message: `Utilisateur ${isBlocked ? 'bloqué' : 'débloqué'} avec succès`,
        user: updatedUser
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      res.status(500).json({ error: 'Erreur lors du changement de statut' });
    }
  },

  // Modifier les informations d'un utilisateur
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { fullName, email, role } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'ID utilisateur manquant' });
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      if (email) {
        const existingUser = await userService.findUserByEmail(email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
      }

      const updatedUser = await userService.updateUserByAdmin(userId, { fullName, email, role });
      
      res.json({
        message: 'Utilisateur mis à jour avec succès',
        user: updatedUser
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
  },

  // Créer un nouvel utilisateur
  async createUser(req: AuthRequest, res: Response) {
    try {
      const { fullName, email, password, role } = req.body;

      // Vérifier si l'email existe déjà
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      const newUser = await userService.createUser(email, password, fullName);
      
      // Mettre à jour le rôle si différent de 'user'
      if (role && role !== 'user') {
        await userService.updateUserByAdmin(newUser.id, { role });
      }

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name,
          role: role || 'user',
          totpEnabled: newUser.totp_enabled,
          isBlocked: newUser.is_blocked,
          createdAt: newUser.created_at
        }
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      res.status(500).json({ error: 'Erreur lors de la création' });
    }
  }
};

// Validations pour les routes admin
export const adminValidations = {
  toggleBlock: [
    body('isBlocked').isBoolean().withMessage('isBlocked doit être un booléen')
  ],
  updateUser: [
    body('fullName').optional().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Rôle invalide')
  ],
  createUser: [
    body('fullName').isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Rôle invalide')
  ]
};
