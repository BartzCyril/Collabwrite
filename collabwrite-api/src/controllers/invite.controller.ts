import { type Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { emailService } from "../services/email.service.js";
import { userService } from "../services/user.service.js";
import { documentService } from "../services/document.service.js";

export const inviteController = {
  async sendInvitation(req: AuthRequest, res: Response) {
    try {
      const { email, documentId, documentName } = req.body;

      // Validation des données
      if (!email || !documentId) {
        return res.status(400).json({
          error: "Email et ID du document sont requis",
        });
      }

      // Validation basique de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: "Adresse email invalide",
        });
      }

      // Validation de l'UUID du document
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(documentId)) {
        return res.status(400).json({
          error: "ID du document invalide. Veuillez ouvrir le document avant d'inviter un collaborateur.",
        });
      }

      // Vérifier si l'utilisateur existe dans la base de données
      const invitedUser = await userService.findUserByEmail(email);
      if (!invitedUser) {
        return res.status(404).json({
          error: "Cet utilisateur n'existe pas dans la base de données. Il doit d'abord créer un compte.",
        });
      }

      // Récupérer l'email de l'utilisateur qui envoie l'invitation
      let inviterEmail: string | undefined = undefined;
      if (req.userId) {
        const inviter = await userService.findUserById(req.userId);
        inviterEmail = inviter?.email;
      }

      // Envoyer l'email d'invitation
      await emailService.sendInvitationEmail(
        email,
        documentName || "Document",
        documentId,
        inviterEmail
      );

      // Affecter le document à l'utilisateur invité
      await documentService.addCollaborator(documentId, invitedUser.id);

      res.status(200).json({
        message: "Invitation envoyée avec succès",
        recipient: email,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation:", error);
      res.status(500).json({
        error: "Erreur lors de l'envoi de l'invitation",
      });
    }
  },

  async verifyEmailConfig(_req: AuthRequest, res: Response) {
    try {
      const isConfigured = await emailService.verifyConnection();

      if (isConfigured) {
        res.status(200).json({
          message: "Configuration email valide",
          configured: true,
        });
      } else {
        res.status(500).json({
          error: "Configuration email invalide",
          configured: false,
        });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de la configuration email:",
        error
      );
      res.status(500).json({
        error: "Erreur lors de la vérification de la configuration email",
        configured: false,
      });
    }
  },
};
