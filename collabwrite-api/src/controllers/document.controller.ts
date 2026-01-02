import { type Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { documentService } from '../services/document.service.js';
import type { CreateDocumentDTO, UpdateDocumentDTO } from '../types/document.types.js';

export const documentController = {
  async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }
      const docs = await documentService.listDocuments(userId);
      res.json(docs);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents : ', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
    }
  },

  async create(req: CreateDocumentDTO, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      const { name, fileType, folderId = null, description = null, content, filePath = null, size = null } = req.body;

      if (!name || !fileType || !content) {
        return res.status(400).json({ error: 'name, fileType et content sont requis' });
      }

      const created = await documentService.createDocument(userId, {
        name,
        fileType,
        folderId,
        description,
        content,
        filePath,
        size,
      });

      res.status(201).json(created);
    } catch (error) {
      console.error("Erreur lors de la création d'un document : ", error);
      res.status(500).json({ error: "Erreur lors de la création d'un document" });
    }
  },

  async update(req: UpdateDocumentDTO, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }
      const { id } = req.params;
      const { name, folderId, description, content } = req.body;

      const updates: { name?: string; folderId?: string | null; description?: string | null; content?: string | null } = {};
      if (name !== undefined) updates.name = name;
      if (folderId !== undefined) updates.folderId = folderId;
      if (description !== undefined) updates.description = description;
      if (content !== undefined) updates.content = content;

      const updated = await documentService.updateDocument(id, userId, updates);
      if (!updated) {
        return res.status(404).json({ error: 'Document introuvable' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du document : ', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du document' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }
      const { id } = req.params as { id: string };
      await documentService.deleteDocument(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression du document : ', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du document' });
    }
  },
};


