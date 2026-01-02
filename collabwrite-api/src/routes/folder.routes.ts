import { Router } from 'express';
import { folderController } from '../controllers/folder.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/all', authenticateToken, (req, res) => {
    folderController.getFolders(req as any, res);
});

router.post('/add', authenticateToken, (req, res) => {
    folderController.createFolder(req as any, res);
});

router.put('/update', authenticateToken, (req, res) => {
    folderController.updateFolder(req as any, res);
});

router.delete('/delete', authenticateToken, (req, res) => {
    folderController.deleteFolder(req as any, res);
});

export default router;