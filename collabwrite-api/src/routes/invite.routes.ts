import { Router } from "express";
import { body } from "express-validator";
import { inviteController } from "../controllers/invite.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

// Route pour envoyer une invitation
router.post(
  "/send",
  authenticateToken,
  validate([
    body("email").isEmail().withMessage("Adresse email invalide"),
    body("documentId").notEmpty().withMessage("ID du document requis"),
    body("documentName").optional().isString(),
  ]),
  (req, res) => {
    inviteController.sendInvitation(req as any, res);
  }
);

// Route pour vérifier la configuration email (utile pour le debug)
router.get("/verify-config", authenticateToken, (req, res) => {
  inviteController.verifyEmailConfig(req as any, res);
});

export default router;
