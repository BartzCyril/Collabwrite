import { type Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { messageService } from "../services/message.service.js";
import type { MessageResponse } from "../types/message.types.js";

export const messageController = {
  /**
   * Récupérer tous les messages d'un document
   */
  async getMessages(req: AuthRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      if (!documentId) {
        return res.status(400).json({ error: "Document ID requis" });
      }

      // Vérifier l'accès au document
      const hasAccess = await messageService.hasAccessToDocument(
        userId!,
        documentId
      );

      if (!hasAccess) {
        return res
          .status(403)
          .json({ error: "Accès refusé à ce document" });
      }

      // Récupérer les messages
      const messages = await messageService.getMessagesByDocument(documentId);

      // Formater la réponse
      const response: MessageResponse[] = messages.map((msg) => ({
        id: msg.id,
        documentId: msg.document_id,
        userId: msg.user_id,
        userFullName: msg.user_full_name,
        userEmail: msg.user_email,
        content: msg.content,
        createdAt: msg.created_at.toISOString(),
        updatedAt: msg.updated_at.toISOString(),
      }));

      res.json(response);
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  /**
   * Créer un nouveau message
   */
  async createMessage(req: AuthRequest, res: Response) {
    try {
      const { documentId } = req.params;
      const { content } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      if (!documentId) {
        return res.status(400).json({ error: "Document ID requis" });
      }

      // Validation
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: "Le message ne peut pas être vide" });
      }

      if (content.length > 2000) {
        return res.status(400).json({ error: "Le message est trop long (max 2000 caractères)" });
      }

      // Vérifier l'accès au document
      const hasAccess = await messageService.hasAccessToDocument(
        userId!,
        documentId
      );

      if (!hasAccess) {
        return res
          .status(403)
          .json({ error: "Accès refusé à ce document" });
      }

      // Créer le message
      const message = await messageService.createMessage(userId!, {
        document_id: documentId,
        content: content.trim(),
      });

      // Formater la réponse
      const response: MessageResponse = {
        id: message.id,
        documentId: message.document_id,
        userId: message.user_id,
        userFullName: message.user_full_name,
        userEmail: message.user_email,
        content: message.content,
        createdAt: message.created_at.toISOString(),
        updatedAt: message.updated_at.toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Erreur lors de la création du message:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  /**
   * Supprimer un message
   */
  async deleteMessage(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: "Non authentifié" });
      }

      if (!messageId) {
        return res.status(400).json({ error: "Message ID requis" });
      }

      // Supprimer le message
      const deleted = await messageService.deleteMessage(messageId, userId!);

      if (!deleted) {
        return res.status(404).json({
          error: "Message introuvable ou vous n'êtes pas autorisé à le supprimer",
        });
      }

      res.json({ message: "Message supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
};

