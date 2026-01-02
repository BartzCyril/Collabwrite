import { Router } from "express";
import { messageController } from "../controllers/message.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { body } from "express-validator";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

// Récupérer les messages d'un document
router.get("/:documentId", authenticateToken, (req, res) => {
  messageController.getMessages(req as any, res);
});

// Créer un nouveau message
router.post(
  "/:documentId",
  authenticateToken,
  validate([
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Le message ne peut pas être vide")
      .isLength({ max: 2000 })
      .withMessage("Le message est trop long (max 2000 caractères)"),
  ]),
  (req, res) => {
    messageController.createMessage(req as any, res);
  }
);

// Supprimer un message
router.delete("/:messageId", authenticateToken, (req, res) => {
  messageController.deleteMessage(req as any, res);
});

export default router;

