import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { adminController, adminValidations } from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

// Routes protégées
router.get('/me', authenticateToken, (req, res) => {
  authController.getCurrentUser(req as any, res);
});
router.post('/setup-2fa', authenticateToken, (req, res) => {
  authController.setup2FA(req as any, res);
});
router.post('/verify-2fa', authenticateToken, (req, res) => {
  authController.verify2FA(req as any, res);
});
router.post('/disable-2fa', authenticateToken, (req, res) => {
  authController.disable2FA(req as any, res);
});
router.put('/profile', authenticateToken, (req, res) => {
  authController.updateProfile(req as any, res);
});
router.put('/password', authenticateToken, (req, res) => {
  authController.updatePassword(req as any, res);
});

// Routes admin (protégées par authentification et rôle admin)
router.get('/admin/users', authenticateToken, (req, res) => {
  // Vérifier le rôle admin
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  adminController.getAllUsers(req as any, res);
});

router.put('/admin/users/:userId/block', authenticateToken, validate(adminValidations.toggleBlock), (req, res) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  adminController.toggleUserBlock(req as any, res);
});

router.put('/admin/users/:userId', authenticateToken, validate(adminValidations.updateUser), (req, res) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  adminController.updateUser(req as any, res);
});

router.post('/admin/users', authenticateToken, validate(adminValidations.createUser), (req, res) => {
  const user = (req as any).user;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  adminController.createUser(req as any, res);
});

export default router;
