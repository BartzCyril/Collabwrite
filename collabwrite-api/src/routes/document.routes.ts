import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { documentController } from '../controllers/document.controller.js';

const router = Router();

router.get('/', authenticateToken, (req, res) => {
  documentController.list(req as any, res);
});

router.post('/', authenticateToken, (req, res) => {
  documentController.create(req as any, res);
});

router.patch('/:id', authenticateToken, (req, res) => {
  documentController.update(req as any, res);
});

router.delete('/:id', authenticateToken, (req, res) => {
  documentController.remove(req as any, res);
});

export default router;


